'use strict';

let _endTime = new Date();
let _durationSeconds = 0;
let _timeIsOver = false;
const _endlessAlarmSound = false;
let _pause = false;

const _clockfaceRunningColor = '#66B366';
const _clockfaceRunningBackgroundColor = '#E5F2E5';
const _clockfaceTimeIsOverColor = '#700000';
const _clockfaceTimeIsOverBackgroundColor = '#f2e5e5';

function updateTimeDisplays() {
	if (!_pause) {
		setTimeout(function () { updateTimeDisplays(); }, 1000);
	} else {
		return;
	}

	const nowTime = new Date();
	nowTime.setMilliseconds(0);

	const remainingTimeSec = calcTimeDifference(nowTime, _endTime);
	if (remainingTimeSec < 1) {
		if (_timeIsOver == false || _endlessAlarmSound) {
			_timeIsOver = true;
			playAlarmSound();
			// eslint-disable-next-line no-new
			new Notification('0:00');
		}
	}

	displayPercentage(remainingTimeSec, _durationSeconds);
	displayDuration(_durationSeconds);
	displayCountdown(remainingTimeSec);
	displayEndTime(new Date(_endTime.getTime()).toLocaleTimeString());
	displayCurrentTime();
	displayCountdownInTitle(remainingTimeSec);

	drawTimeClockface(calcPercentage(remainingTimeSec, _durationSeconds));
}

/* @return String */
function formatTimeFromSecondsToString(timeSeconds) {
	let negativeTime = false;
	if (timeSeconds < 0) {
		timeSeconds *= -1;
		negativeTime = true;
	}

	const hours 	= 	Math.trunc(timeSeconds / (24 * 60));
	const minutes 	= 	Math.trunc((timeSeconds - hours * (24 * 60)) / 60);
	const seconds 	= 	timeSeconds - hours * (24 * 60) - minutes * 60;

	let timeString = '';

	if (negativeTime) {
		timeString += '-';
	}

	if (hours > 0) {
		timeString += hours.toString().padStart(2, '0') + ':';
		timeString += minutes.toString().padStart(2, '0') + ':';
	} else {
		if (minutes > 0) {
			timeString += minutes + ':';
		}
	}

	timeString += seconds.toString().padStart(2, '0');

	return timeString;
}

function displayCountdown(timeSec) {
	const timeString = formatTimeFromSecondsToString(timeSec);
	document.getElementById('countdown').innerHTML = timeString;
}

/* return percentage 0-100 */
function calcPercentage(remainingTimeSec, durationTimeSec) {
	let percent = 0;
	if (_timeIsOver || remainingTimeSec < 0) {
		percent = remainingTimeSec / 60 - 100;
	} else {
		percent = remainingTimeSec / durationTimeSec * 100;
	}

	return percent;
}

function displayPercentage(remainingTimeSec, durationSec) {
	const percent = calcPercentage(remainingTimeSec, durationSec);

	let percentageText = '';
	if (_timeIsOver || percent < 0) {
		percentageText = '-';
	} else {
		percentageText = parseInt(percent) + '%';
	}
	document.getElementById('percent').innerHTML = percentageText;
}

function displayDuration(durationSeconds) {
	const durMin = parseInt(durationSeconds / 60) + '';
	const durSec = (durationSeconds % 60) + '';
	document.getElementById('duration').innerHTML = durMin + ':' + durSec.padStart(2, '0');
}

function displayEndTime(timeString) {
	document.getElementById('endTime').innerHTML = timeString;
}

function displayCurrentTime() {
	document.getElementById('currentTime').innerHTML = new Date().toLocaleTimeString();
}

function displayCountdownInTitle(timeSec) {
	const timeString = formatTimeFromSecondsToString(timeSec);
	setDocumentTitle(timeString + ' ⏰');
}

function setDocumentTitle(title) {
	document.title = title;
}

function setCountdownInput(durationSec) {
	document.getElementById('setTimeMin').value = parseInt(durationSec / 60);
	document.getElementById('setTimeSec').value = durationSec % 60;
}

/* @return seconds */
function calcTimeDifference(time1, time2) {
	return (time2.getTime() - time1.getTime()) / 1000; // in seconds
}

function playAlarmSound() {
	document.getElementById('sound').muted = false;
	document.getElementById('sound').play();
}

function startCountdown(endTime, initialDuration) {
	_endTime = new Date(endTime);
	_endTime.setMilliseconds(0);
	_durationSeconds = initialDuration;
	_timeIsOver = (calcTimeDifference(new Date(), _endTime) < 1);
	updateTimeDisplays();
}

function drawTimeClockface(percent) {
	let clockfaceColor = _clockfaceRunningColor;
	let clockfaceBackgroundColor = _clockfaceRunningBackgroundColor;

	if (_timeIsOver) {
		clockfaceColor = _clockfaceTimeIsOverColor;
		clockfaceBackgroundColor = _clockfaceTimeIsOverBackgroundColor;
	}

	const clockfaceDiv = document.getElementById('clockface');
	const clockfaceSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

	clockfaceSVG.setAttribute('viewBox', '0 0 100 100');
	clockfaceSVG.setAttribute('width', '100%');
	clockfaceSVG.setAttribute('height', '100%');

	clockfaceSVG.appendChild(drawTimeClockfaceCircle(100, clockfaceBackgroundColor, 'transparent'));
	clockfaceSVG.appendChild(drawTimeClockfaceCircle(percent, clockfaceColor, 'transparent'));

	document.getElementById('countdown').style.backgroundColor = clockfaceColor;

	clockfaceDiv.replaceChildren(clockfaceSVG);
}

function drawTimeClockfaceCircle(fill, strokeColor, fillColor) {
	const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
	const cx = 50;
	const cy = 50;
	const radius = 45;
	const angle = -90;
	const rotate = angle + ' ' + cx + ' ' + cy;
	const strokeWidth = 3;
	const dashArray = 2 * Math.PI * radius;
	const dashOffset = dashArray - (dashArray * fill / 100);

	circle.setAttribute('cx', cx);
	circle.setAttribute('cy', cy);
	circle.setAttribute('r', radius);
	circle.setAttribute('fill', fillColor);
	circle.setAttribute('stroke', strokeColor);
	circle.setAttribute('stroke-width', strokeWidth);
	circle.setAttribute('stroke-dasharray', dashArray);
	circle.setAttribute('stroke-dashoffset', dashOffset);
	circle.setAttribute('transform', 'rotate(' + rotate + ')');

	return circle;
}

function _init_buttons() {
	document.getElementById('setTime').addEventListener('submit', function (e) {
		const durMin 	= parseInt(document.getElementById('setTimeMin').value) || 0;
		const durSec 	= parseInt(document.getElementById('setTimeSec').value) || 0;
		const durationSec = 60 * durMin + durSec;
		const end 		= new Date(Date.now() + 1000 * durationSec).toGMTString();
		const url 		= new URL(window.location);

		window.location.href = url.pathname + '?end=' + end + '&dur=' + durationSec;

		e.preventDefault();
	});

	document.getElementById('pauseCountdown').addEventListener('click', function (e) {
		if (!_pause) {
			_pause 		= true;
			const url 	= new URL(window.location);
			const dur 	= parseInt(url.searchParams.get('dur'));
			const end 	= url.searchParams.get('end');
			const left 	= parseInt(calcTimeDifference(new Date(), new Date(end)) + 1);
			window.location.href = url.pathname + '?dur=' + dur + '&left=' + left;
		}
	});

	document.getElementById('continueCountdown').addEventListener('click', function (e) {
		if (_pause) {
			const url = new URL(window.location);
			const left = parseInt(url.searchParams.get('left'));
			const dur = parseInt(url.searchParams.get('dur'));
			const end = new Date(new Date().getTime() + (left * 1000)).toGMTString();
			window.location.href = url.pathname + '?dur=' + dur + '&end=' + end;
		}
	});

	document.getElementById('notifyperm').addEventListener('click', function (e) {
		// Function to actually ask the permissions
		function handlePermission(permission) {
			// Whatever the user answers, we make sure Chrome stores the information
			if (!Reflect.has(Notification, 'permission')) {
				Notification.permission = permission;
			}

			// Set the button to shown or hidden, depending on what the user answers
			if (checkNotificationPermission()) {
				// eslint-disable-next-line no-new
				new Notification('✅');
			} else {
				console.log('denied');
			}
		}

		function checkNotificationPermission() {
			if (Notification.permission === 'denied' || Notification.permission === 'default') {
				return false;
			} else {
				return true;
			}
		}

		function checkNotificationPromise() {
			try {
				Notification.requestPermission().then();
			} catch (e) {
				return false;
			}

			return true;
		}

		// Check if the browser supports notifications
		if (!Reflect.has(window, 'Notification')) {
			console.log('This browser does not support notifications.');
		} else {
			if (checkNotificationPromise()) {
				Notification.requestPermission().then(handlePermission);
			} else {
				Notification.requestPermission(handlePermission);
			}
		}
	});
}

function init() {
	_init_buttons();

	const url 		= new URL(window.location);
	let duration 	= parseInt(url.searchParams.get('dur'));
	let end 		= url.searchParams.get('end');
	const left 		= parseInt(url.searchParams.get('left'));

	if (left) {
		_pause = true;
		if (left < 1) {
			_timeIsOver = true;
		}
		drawTimeClockface(calcPercentage(left, duration));
		setCountdownInput(duration);
		displayPercentage(left, duration);
		displayCountdown(left);

		return;
	}

	if (!duration && !end) {
		_durationSeconds = 0;
		drawTimeClockface(0);
		displayCountdown(0);
		return;
	}
	if (end) {
		end = new Date(end);
		if (!duration) {
			duration = parseInt(calcTimeDifference(new Date(), end).getTime() / 1000);
		}
	}
	if (!end) {
		if (!duration) {
			duration = 0;
		}
		end = new Date(Date.now()).toGMTString();
		window.location.href = url.pathname + '?end=' + end + '&dur=' + duration;
	}

	setCountdownInput(duration);

	if (duration > 0) {
		startCountdown(end, duration);
	} else {
		_durationSeconds = 0;
		drawTimeClockface(0);
		displayCountdown(0);
	}
}

init();
