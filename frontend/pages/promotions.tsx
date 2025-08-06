
import { NextPage } from "next"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../../lib/sdk"

const PromotionsPage: NextPage = () => {
  const { data, isLoading, isError } = useQuery(["promotions"], () => sdk.promotions.list())

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error fetching promotions</div>
  }

  return (
    <div>
      <h1>Promotions</h1>
      <ul>
        {data.promotions.map((promotion) => (
          <li key={promotion.id}>{promotion.type}</li>
        ))}
      </ul>
    </div>
  )
}

export default PromotionsPage
