from enum import Enum


class UserRole(str, Enum):
    BUYER = "buyer"
    SUPPLIER = "supplier"


class RFQStatus(str, Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"
