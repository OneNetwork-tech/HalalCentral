
import { NextPage } from "next"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../../lib/sdk"

const EventsPage: NextPage = () => {
  const { data, isLoading, isError } = useQuery(["events"], () => sdk.events.list())

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error fetching events</div>
  }

  return (
    <div>
      <h1>Events</h1>
      <ul>
        {data.events.map((event) => (
          <li key={event.id}>{event.title}</li>
        ))}
      </ul>
    </div>
  )
}

export default EventsPage
