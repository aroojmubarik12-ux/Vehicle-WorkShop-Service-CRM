import { SLA } from "../models/SLA";

export const calculateSlaDeadline = async (
  priority: "low" | "medium" | "high" | "critical",
  serviceType: string = "all"
): Promise<{ deadline: Date; responseHours: number; turnaroundHours: number }> => {
  let slaRule = await SLA.findOne({ priority, serviceType, status: "active" });
  if (!slaRule) {
    slaRule = await SLA.findOne({ priority, status: "active" });
  }

  let turnaroundHours = 48;
  let responseHours = 8;

  if (slaRule) {
    turnaroundHours = slaRule.turnaroundTimeHours;
    responseHours = slaRule.responseTimeHours;
  } else {
    switch (priority) {
      case "critical":
        responseHours = 1;
        turnaroundHours = 4;
        break;
      case "high":
        responseHours = 2;
        turnaroundHours = 24;
        break;
      case "medium":
        responseHours = 8;
        turnaroundHours = 48;
        break;
      case "low":
        responseHours = 24;
        turnaroundHours = 72;
        break;
    }
  }

  const deadline = new Date(Date.now() + turnaroundHours * 60 * 60 * 1000);
  return { deadline, responseHours, turnaroundHours };
};
