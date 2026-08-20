package com.procurement.user.entity;

/** Access level of a user-specific permission override. */
public enum PermissionAccess {
    /** Explicitly grants the permission to this user. */
    ALLOW,
    /** Explicitly revokes the permission for this user. */
    DENY
}
