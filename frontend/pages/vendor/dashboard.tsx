
import { NextPage } from "next"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../../lib/sdk"

import { useTranslation } from "next-i18next"

const VendorDashboard: NextPage = () => {
  const { t } = useTranslation("common")
  const { data, isLoading, isError } = useQuery(["vendors"], () => sdk.vendors.list())

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error fetching vendors</div>
  }

  return (
    <div>
      <h1>{t("vendor_dashboard_title")}</h1>
      <ul>
        {data.vendors.map((vendor) => (
          <li key={vendor.id}>{vendor.name}</li>
        ))}
      </ul>
    </div>
  )
}

export default VendorDashboard
