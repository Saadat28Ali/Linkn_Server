function getCurrentTime() {
    const dateObj = new Date();
    const currentTime = {
        year: dateObj.getFullYear(), 
        month: dateObj.getMonth() + 1, 
        date: dateObj.getDate(), 
        hours: dateObj.getHours(), 
        minutes: dateObj.getMinutes(), 
        seconds: dateObj.getSeconds(), 
        milliseconds: dateObj.getMilliseconds()
    };
    return currentTime;
}

function getTimestamp(time) {
    return `${time.date}/${time.month}/${time.year} | ${time.hours}:${time.minutes}:${time.seconds}:${time.milliseconds}`;
}

function getLaterTime(time1, time2) {
    
    // compares two times and returns the
    // later one
    // returns null if the times are equal

    for (let key of Object.keys(time1)) {
        if (time1[key] > time2[key]) return time1;
        else if (time2[key] > time1[key]) return time2;
    }

    return null;
}

function getTimeDifference(time1, time2) {
    const laterTime = getLaterTime(time1, time2);
    if (laterTime === null) return {
        year: 0,
        month: 0, 
        date: 0, 
        hours: 0, 
        minutes: 0, 
        seconds: 0, 
        milliseconds: 0
    };
    const earlierTime = (laterTime === time1) ? time2 : time1;

    let timeDiff = {
        year: laterTime.year - earlierTime.year, 
        month: laterTime.month - earlierTime.month, 
        date: laterTime.date - earlierTime.date, 
        hours: laterTime.hours - earlierTime.hours, 
        minutes: laterTime.minutes - earlierTime.minutes, 
        seconds: laterTime.seconds - earlierTime.seconds, 
        milliseconds: laterTime.milliseconds - earlierTime.milliseconds, 
    }
    return timeDiff;
}

function getTimeSum(time1, time2) {
    return getValidTime({
        year: time1.year + time2.year, 
        month: time1.month + time2.month, 
        date: time1.date + time2.date, 
        hours: time1.hours + time2.hours, 
        minutes: time1.minutes + time2.minutes, 
        seconds: time1.seconds + time2.seconds, 
        milliseconds: time1.milliseconds + time2.milliseconds, 
    });
}

function isLeapYear(year) {
    return ((year % 4 === 0) && (year % 100 !== 0 || year % 400 === 0));
}

function getValidTime(time) {
    // makes sure time does not have illegal values

    if (time.milliseconds > 1000) {
        time.seconds += Math.floor(time.milliseconds / 1000);
        time.milliseconds = time.milliseconds % 1000;
    }

    if (time.seconds > 60) {
        time.minutes += Math.floor(time.seconds / 60);
        time.seconds = time.seconds % 60;
    }

    if (time.minutes > 60) {
        time.hours += Math.floor(time.minutes / 60);
        time.minutes = time.minutes % 60;
    }

    if (time.hours > 24) {
        time.date += Math.floor(time.hours / 24);
        time.hours = time.hours % 24;
    }

    if ([1, 3, 5, 7, 8, 10, 12].includes(time.month)) {
        if (time.date > 31) {
            time.month += Math.floor(time.date / 31);
            time.date = time.date % 31;
        }
    } else if ([4, 6, 9, 11].includes(time.month)) {
        if (time.date > 30) {
            time.month += Math.floor(time.date / 30);
            time.date = time.date % 30;
        }
    } else {
        if (isLeapYear(time.year)) {
            if (time.date > 29) {
                time.month += Math.floor(time.date / 29);
                time.date = time.date % 29;
            }
        } else {
            if (time.date > 28) {
                time.month += Math.floor(time.date / 28);
                time.date = time.date % 28;
            }
        }
    }

    if (time.month > 12) {
        time.year += Math.floor(time.month / 12);
        time.month = time.month % 12;
    }

    return time;
}

export {
    getCurrentTime, 
    getTimestamp, 
    getLaterTime, 
    getTimeDifference, 
    getTimeSum, 
    isLeapYear, 
    getValidTime
};