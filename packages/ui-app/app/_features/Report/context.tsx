import { getMonthList } from "@shared/libs";
import { ListItemValue } from "@shared/ui";
import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useState } from "react";


enum IReportTimeFilter {
  WEEK,
  MONTH
}

type TReportDuration = {
  from: Date,
  to: Date
}
interface IReportProps {
  timeFilter: IReportTimeFilter
  setTimeFilter: Dispatch<SetStateAction<IReportTimeFilter>>
  selectedProjectIds: string[]
  setProjectIds: Dispatch<SetStateAction<string[]>>
  selectedMemberIds: string[]
  setMemberIds: Dispatch<SetStateAction<string[]>>

  selectedMonth: string
  setSelectedMonth: Dispatch<SetStateAction<string>>

  duration: TReportDuration,
  setDuration: Dispatch<SetStateAction<TReportDuration>>

}

const ReportContext = createContext<IReportProps>({
  timeFilter: IReportTimeFilter.WEEK,
  setTimeFilter: () => console.log(1),

  selectedMemberIds: [],
  setMemberIds: () => console.log(1),

  selectedProjectIds: [],
  setProjectIds: () => console.log(1),

  selectedMonth: '',
  setSelectedMonth: () => console.log(1),

  duration: {
    from: new Date(),
    to: new Date()
  },

  setDuration: () => console.log(1)
})

function useMonthList() {
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1 + '')

  return { selectedMonth, setSelectedMonth }
}

export const ReportProvider = ({ children }: { children: ReactNode }) => {
  const [timeFilter, setTimeFilter] = useState<IReportTimeFilter>(IReportTimeFilter.WEEK)
  const [projectIds, setProjectIds] = useState<string[]>([])
  const [selectedMemberIds, setMemberIds] = useState<string[]>([])
  const { selectedMonth, setSelectedMonth } = useMonthList()
  const [duration, setDuration] = useState<TReportDuration>({ from: new Date(), to: new Date() })


  return <ReportContext.Provider value={{
    timeFilter,
    setTimeFilter,
    selectedProjectIds: projectIds,
    setProjectIds,
    selectedMemberIds,
    setMemberIds,
    selectedMonth,
    setSelectedMonth,
    duration,
    setDuration
  }} >
    <div id='report-page'>
      <main>
        {children}
      </main>
    </div>
  </ReportContext.Provider>
}

// export const ReportProvider = ReportContext.Provider

export const useReportContext = () => {
  const context = useContext(ReportContext)
  const { setProjectIds, setMemberIds } = context

  const toggleProjectIds = (projectId: string) => {
    setProjectIds(oldProjectIds => {
      if (oldProjectIds.includes(projectId)) {
        return oldProjectIds.filter(oid => oid !== projectId)
      }

      return [...oldProjectIds, projectId]

    })
  }

  const toggleMemberIds = (memberId: string) => {
    setMemberIds(oldMemberIds => {
      if (oldMemberIds.includes(memberId)) {
        return oldMemberIds.filter(oid => oid !== memberId)
      }

      return [...oldMemberIds, memberId]

    })
  }
  return {
    ...context, ...{ toggleProjectIds, toggleMemberIds }
  }
}
