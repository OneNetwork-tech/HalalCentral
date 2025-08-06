
import Medusa from "@medusajs/medusa-js"

const medusa = new Medusa({ baseUrl: "http://localhost:9000", maxRetries: 3 })

export const sdk = {
  vendors: {
    list: () => medusa.client.request("GET", "/vendors"),
    findById: (id: string) => medusa.client.request("GET", `/vendors/${id}`),
  },
  institutes: {
    list: () => medusa.client.request("GET", "/institutes"),
    findById: (id: string) => medusa.client.request("GET", `/institutes/${id}`),
  },
,
  events: {
    list: () => medusa.client.request("GET", "/events"),
    findById: (id: string) => medusa.client.request("GET", `/events/${id}`),
  },
  promotions: {
    list: () => medusa.client.request("GET", "/promotions"),
    findById: (id: string) => medusa.client.request("GET", `/promotions/${id}`),
  }
}