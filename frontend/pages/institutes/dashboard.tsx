
import { NextPage } from "next"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../../lib/sdk"

import { useTranslation } from "next-i18next"

const InstituteDashboard: NextPage = () => {
  const { t } = useTranslation("common")
  const { data, isLoading, isError } = useQuery(["institutes"], () => sdk.institutes.list())

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error fetching institutes</div>
  }

  return (
    <div>
      <h1>{t("institute_dashboard_title")}</h1>
      <ul>
        {data.institutes.map((institute) => (
          <li key={institute.id}>{institute.name}</li>
        ))}
      </ul>
    </div>
  )
}

export default InstituteDashboard
