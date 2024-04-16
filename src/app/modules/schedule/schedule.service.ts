import { addHours, format } from "date-fns";

const createScheduleIntoDB = async (payload: any) => {
  const { startDate, endDate, startTime, endTime } = payload;

  const currentData = new Date(startDate);
  const lastData = new Date(endDate);

  while (startDate <= endDate) {
    const startDateTime = new Date(
      addHours(
        `${format(currentData, "yyyy-MM-dd")}`,
        Number(startTime.split(":")[0])
      )
    );
    const endDateTime = new Date(
      addHours(
        `${format(lastData, "yyyy-MM-dd")}`,
        Number(endTime.split(":")[0])
      )
    );
    console.log(endDateTime);
  }
};

export const ScheduleService = {
  createScheduleIntoDB,
};
