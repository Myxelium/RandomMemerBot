import { dateToString } from "./converters";
import { LoggerColors } from "./loggerColors";

/**
 * Logs the wait time, current time, next join time, and cron schedule in the console.
 * @param waitTime - The time to wait until the next join.
 * @param hour - The hour of the cron schedule.
 * @param minute - The minute of the cron schedule.
 */
export function logger(
    waitTime: Date, 
    hour: number, 
    minute: number
){
    const currentTime = new Date();

    console.log(
        LoggerColors.Cyan, `
        Wait time: ${(waitTime.getTime() - currentTime.getTime()) / 60000} minutes,
        Current time: ${dateToString(currentTime)}, 
        Next join time: ${dateToString(waitTime)},
        Cron: ${Math.floor(minute)} ${Math.floor(hour) == 0 ? '*' : Math.floor(hour) } * * *`
    );
}