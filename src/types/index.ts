// item type
export type Item = {
  id: string;
  name: string;
  total_quantity: number;
  created_at: string;
  updated_at: string;
};

// reservation type
export type Reservation = {
  id: string;
  item_id: string;
  customer_id: string;
  quantity: number;
  status: ReservationStatuses;
  expires_at: string;
  created_at: string;
  updated_at: string;
};

// statuses
export type ReservationStatuses =
  | "CONFIRMED"
  | "CANCELLED"
  | "PENDING"
  | "EXPIRED";

// helper type for monitoring of quantities
export type ItemStatus = {
  id: string;
  name: string;
  total_quantity: number;
  available_quantity: number;
  reserved_quantity: number;
  confirmed_quantity: number;
};

// api response
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

export type GetItemParams = {
  id: string;
};
