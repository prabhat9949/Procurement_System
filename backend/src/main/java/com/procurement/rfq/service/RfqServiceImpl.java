package com.procurement.rfq.service;
import com.procurement.common.exception.*;import com.procurement.common.response.*;import com.procurement.product.entity.Product;import com.procurement.purchaserequest.entity.*;import com.procurement.purchaserequest.repository.PurchaseRequestRepository;import com.procurement.purchaserequestline.entity.PurchaseRequestLine;import com.procurement.purchaserequestline.repository.PurchaseRequestLineRepository;import com.procurement.rfq.dto.request.*;import com.procurement.rfq.dto.response.*;import com.procurement.rfq.entity.*;import com.procurement.rfq.exception.*;import com.procurement.rfq.mapper.*;import com.procurement.rfq.repository.*;import com.procurement.rfq.specification.*;import com.procurement.vendor.entity.Vendor;import com.procurement.vendor.repository.VendorRepository;import org.springframework.data.domain.*;import org.springframework.security.core.context.SecurityContextHolder;import org.springframework.stereotype.Service;import org.springframework.transaction.annotation.Transactional;import java.time.*;import java.util.*;
@Service public class RfqServiceImpl implements RfqService{private final RfqRepository repo;private final RfqLineRepository lines;private final PurchaseRequestRepository requests;private final PurchaseRequestLineRepository requestLines;private final RfqMapper mapper;private final com.procurement.procurement.scope.service.ProcurementScopeService scopeService;private final VendorRepository vendors;private final RfqVendorRepository rfqVendors;public RfqServiceImpl(RfqRepository r,RfqLineRepository l,PurchaseRequestRepository p,PurchaseRequestLineRepository pl,RfqMapper m,com.procurement.procurement.scope.service.ProcurementScopeService scopeService,VendorRepository v,RfqVendorRepository rv){repo=r;lines=l;requests=p;requestLines=pl;mapper=m;this.scopeService=scopeService;this.vendors=v;this.rfqVendors=rv;}private String user(){var a=SecurityContextHolder.getContext().getAuthentication();return a==null?"system":a.getName();}private Rfq find(Long id){return repo.findById(id).orElseThrow(()->new RfqNotFoundException(id));}private void dates(RfqRequest r){if(!r.closingDate().isAfter(LocalDate.now()))throw new BadRequestException("Closing date must be after issue date");if(!r.quotationOpeningDate().isAfter(r.closingDate()))throw new BadRequestException("Quotation opening date must be after closing date");}
@Transactional public RfqResponse generate(RfqRequest r){
    dates(r);
    var pr=requests.findById(r.purchaseRequestId()).orElseThrow(()->new ResourceNotFoundException("Purchase request not found: "+r.purchaseRequestId()));
    if(pr.getApprovalStatus()!=ApprovalStatus.APPROVED){
        throw new ConflictException("Only approved purchase requests can generate RFQ");
    }
    if(pr.getStatus()==PurchaseRequestStatus.INTERNAL_FULFILMENT_IN_PROGRESS||pr.getStatus()==PurchaseRequestStatus.INTERNALLY_FULFILLABLE||pr.getStatus()==PurchaseRequestStatus.COMPLETED){
        throw new ConflictException("This purchase request is fulfilled internally. External RFQ creation is not allowed.");
    }
    if(pr.getStatus()!=PurchaseRequestStatus.APPROVED&&pr.getStatus()!=PurchaseRequestStatus.EXTERNAL_PROCUREMENT_REQUIRED&&pr.getStatus()!=PurchaseRequestStatus.PARTIAL_FULFILMENT_PENDING){
        throw new ConflictException("Internal availability check must require external procurement before RFQ generation (Current status: "+pr.getStatus()+")");
    }
    if(repo.findByPurchaseRequestId(pr.getId()).isPresent())throw new ConflictException("Purchase request already has an RFQ");
    var e=Rfq.builder().rfqNumber("RFQ-"+Year.now().getValue()+"-"+String.format("%06d",repo.count()+1)).purchaseRequest(pr).issueDate(LocalDate.now()).closingDate(r.closingDate()).quotationOpeningDate(r.quotationOpeningDate()).currency(r.currency().toUpperCase()).status(RfqStatus.OPEN).remarks(r.remarks()).createdBy(user()).updatedBy(user()).build();
    while(repo.existsByRfqNumber(e.getRfqNumber()))e.setRfqNumber("RFQ-"+Year.now().getValue()+"-"+String.format("%06d",repo.count()+2));
    e=repo.save(e);
    for(PurchaseRequestLine pl:requestLines.findByPurchaseRequestId(pr.getId()))lines.save(RfqLine.builder().rfq(e).product(pl.getProduct()).quantity(pl.getQuantity()).requiredDate(pr.getRequiredDate()).estimatedUnitPrice(pl.getUnitPrice()).remarks(pl.getRemarks()).build());
    // Auto-invite every active + approved vendor so the whole vendor base can
    // immediately see the RFQ and give quotations (no manual per-vendor invite).
    vendors.findAll().stream()
            .filter(v -> "ACTIVE".equalsIgnoreCase(v.getStatus()) && Boolean.TRUE.equals(v.getApproved()))
            .forEach(v -> {
                if (!rfqVendors.existsByRfqIdAndVendorId(e.getId(), v.getId())) {
                    rfqVendors.save(RfqVendor.builder().rfq(e).vendor(v)
                            .remarks("Auto-invited for quotation")
                            .responseStatus(RfqVendorStatus.INVITED).build());
                }
            });
    pr.setStatus(PurchaseRequestStatus.RFQ_CREATED);
    requests.save(pr);
    return mapper.toResponse(e);
}
@Transactional(readOnly=true)public PageResponse<RfqResponse> search(String k,RfqStatus s,Long d,Pageable p){var spec=RfqSpecification.search(k,s,d);var catSpec=RfqSpecification.categoryIn(scopeService.myCategoryIds());if(catSpec!=null)spec=spec.and(catSpec);Page<RfqResponse>x=repo.findAll(spec,p).map(mapper::toResponse);return new PageResponse<>(x.getContent(),x.getNumber(),x.getSize(),x.getTotalElements(),x.getTotalPages(),x.isLast());}@Transactional(readOnly=true)public RfqResponse get(Long id){return mapper.toResponse(find(id));}
@Transactional public RfqResponse update(Long id,RfqRequest r){var e=find(id);if(e.getStatus()!=RfqStatus.DRAFT)throw new ConflictException("Only draft RFQs can be updated");dates(r);e.setClosingDate(r.closingDate());e.setQuotationOpeningDate(r.quotationOpeningDate());e.setCurrency(r.currency().toUpperCase());e.setRemarks(r.remarks());e.setUpdatedBy(user());return mapper.toResponse(repo.save(e));}@Transactional public void delete(Long id){var e=find(id);if(e.getStatus()!=RfqStatus.DRAFT)throw new ConflictException("Only draft RFQs can be deleted");if(!lines.findByRfqId(id).isEmpty())throw new ConflictException("RFQ with lines cannot be deleted");repo.delete(e);}@Transactional public RfqResponse open(Long id){var e=find(id);if(e.getStatus()!=RfqStatus.DRAFT)throw new ConflictException("Only draft RFQs can be opened");e.setStatus(RfqStatus.OPEN);return mapper.toResponse(repo.save(e));}@Transactional public RfqResponse close(Long id){var e=find(id);if(e.getStatus()!=RfqStatus.OPEN)throw new ConflictException("Only open RFQs can be closed");e.setStatus(RfqStatus.CLOSED);return mapper.toResponse(repo.save(e));}@Transactional public RfqResponse cancel(Long id){var e=find(id);if(e.getStatus()==RfqStatus.CLOSED||e.getStatus()==RfqStatus.AWARDED)throw new ConflictException("Closed or awarded RFQs cannot be cancelled");e.setStatus(RfqStatus.CANCELLED);return mapper.toResponse(repo.save(e));}}
