export const SHIPPING_FLAT = 4.95
export const FREE_SHIPPING_THRESHOLD = 50
export const VAT_RATE = 0.21

export type ShippingDetails = {
  name: string
  address: string
  postal: string
  city: string
  paymentMethod: "ideal" | "applepay" | "creditcard"
}
