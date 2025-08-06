import { WidgetConfig } from "@medusajs/admin"
import { useEffect, useState } from "react"

const CommissionOverviewWidget = () => {
  const [commissionData, setCommissionData] = useState({
    totalCommissions: 0,
    pendingPayouts: 0,
    thisMonth: 0
  })

  useEffect(() => {
    fetchCommissionData()
  }, [])

  const fetchCommissionData = async () => {
    try {
      const response = await fetch('/admin/commissions/overview')
      const data = await response.json()
      setCommissionData(data)
    } catch (error) {
      console.error('Error fetching commission data:', error)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Commission Overview</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">
            {commissionData.totalCommissions.toLocaleString('sv-SE')} SEK
          </p>
          <p className="text-sm text-gray-600">Total Commissions</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-600">
            {commissionData.pendingPayouts.toLocaleString('sv-SE')} SEK
          </p>
          <p className="text-sm text-gray-600">Pending Payouts</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">
            {commissionData.thisMonth.toLocaleString('sv-SE')} SEK
          </p>
          <p className="text-sm text-gray-600">This Month</p>
        </div>
      </div>
    </div>
  )
}

export const config: WidgetConfig = {
  zone: "product.list.before",
}

export default CommissionOverviewWidget