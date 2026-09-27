/* global moment */
(function () {
  moment.locale("fr");

  try {
    history.replaceState(null, "", "/?vt=agendaWeek&dt=2026-10-05&et=group&fid0=L1ST");
  } catch (e) {}

  var MOBILE_BP = 768;

  function isMobile() {
    return window.innerWidth < MOBILE_BP;
  }

  function showDetail(ev) {
    $("#sidebarEventContentDiv").html(
      '<div class="sidebarEventItemDiv">' +
        '<div class="sideBarItemTitle"><strong>' +
        ev.title +
        "</strong></div>" +
        '<div class="sideBarItemContent">' +
        "<div><strong>Horaire:</strong> " +
        moment(ev.start).format("HH:mm") +
        " – " +
        moment(ev.end).format("HH:mm") +
        "</div>" +
        "<div><strong>Salle:</strong> " +
        (ev.room || "") +
        "</div>" +
        "<div><strong>Enseignant:</strong> " +
        (ev.staff || "") +
        "</div>" +
        "<div><strong>Groupe:</strong> " +
        (ev.group || "L1ST") +
        "</div>" +
        "<div><strong>Catégorie:</strong> " +
        (ev.cat || "") +
        "</div>" +
        "</div></div>"
    );
  }

  function eventRender(event, element) {
    var lines = [event.title];
    if (event.room) lines.push(event.room);
    if (event.staff) lines.push(event.staff);
    if (event.group) lines.push(event.group);
    if (event.cat) lines.push(event.cat);
    element.find(".fc-content").html(
      '<div class="fc-time" data-start="' +
        moment(event.start).format("HH:mm") +
        '" data-full="' +
        moment(event.start).format("HH:mm") +
        " - " +
        moment(event.end).format("HH:mm") +
        '"><span>' +
        moment(event.start).format("HH:mm") +
        " - " +
        moment(event.end).format("HH:mm") +
        "</span></div>" +
        lines.join("\n\n<br>\n\n")
    );
  }

  function fixTitle() {
    var view = $("#calendar").fullCalendar("getView");
    if (!view) return;
    if (view.name === "agendaDay") {
      $(".fc-center h2").text(moment(view.start).format("D MMMM YYYY"));
    } else {
      var start = moment(view.start);
      var end = moment(view.end).subtract(1, "day");
      var sameMonth = start.month() === end.month() && start.year() === end.year();
      $(".fc-center h2").text(
        sameMonth
          ? start.format("D") + " – " + end.format("D MMM YYYY")
          : start.format("D MMM") + " – " + end.format("D MMM YYYY")
      );
    }
    if (!$(".fc-center .fa-calendar").length) {
      $(".fc-center").append(' <i class="fa fa-calendar" aria-hidden="true"></i>');
    }
  }

  function calHeight() {
    if (isMobile()) {
      return Math.max(420, window.innerHeight - 220);
    }
    return 687;
  }

  $("#calendar").fullCalendar({
    locale: "fr",
    defaultView: isMobile() ? "agendaDay" : "agendaWeek",
    defaultDate: "2026-10-05",
    firstDay: 1,
    weekends: true,
    hiddenDays: [0],
    allDaySlot: true,
    allDayText: "Toute la journée",
    minTime: "08:00:00",
    maxTime: "20:00:00",
    slotDuration: "00:30:00",
    slotLabelInterval: "01:00:00",
    slotLabelFormat: "HH",
    height: calHeight(),
    header: {
      left: "today prev,next",
      center: "title",
      right: "agendaWeek,agendaDay,listWeek",
    },
    buttonText: {
      today: "Aujourd'hui",
      week: "Semaine",
      day: "Jour",
      list: "Mon planning",
    },
    dayNamesShort: ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"],
    columnFormat: "ddd. D/M",
    eventRender: eventRender,
    eventClick: function (calEvent) {
      showDetail(calEvent);
      openSidebar();
    },
    events: window.CELCAT_EVENTS,
    viewRender: fixTitle,
    windowResize: function () {
      var want = isMobile() ? "agendaDay" : "agendaWeek";
      var cur = $("#calendar").fullCalendar("getView").name;
      if (cur !== want && (cur === "agendaDay" || cur === "agendaWeek")) {
        $("#calendar").fullCalendar("changeView", want);
      }
      $("#calendar").fullCalendar("option", "height", calHeight());
    },
  });

  var SIDEBAR_MS = 500;
  var SIDEBAR_W = 350;
  var sidebarOpen = false;
  var sidebarAnimating = false;

  function openSidebar() {
    if (sidebarOpen || sidebarAnimating) return;
    sidebarOpen = true;
    sidebarAnimating = true;
    var w = isMobile() ? $(window).width() : SIDEBAR_W;
    $("#sidebarOutBtnDiv").hide();
    $("#sidebarInBtnDiv").show().css("display", "block");
    $("#calendarSidebar")
      .removeAttr("hidden")
      .stop(true, false)
      .css({ display: "block", overflow: "hidden", width: 0 })
      .animate({ width: w }, SIDEBAR_MS, "swing", function () {
        sidebarAnimating = false;
        $(this).css("overflow", "");
        $("#calendar").fullCalendar("option", "height", calHeight());
      });
    if (!isMobile()) {
      $("#mainContentDiv").stop(true, false).animate({ marginLeft: SIDEBAR_W }, SIDEBAR_MS, "swing");
    } else {
      $("body").addClass("sidebar-open-mobile");
    }
  }

  function closeSidebar() {
    if (!sidebarOpen || sidebarAnimating) return;
    sidebarOpen = false;
    sidebarAnimating = true;
    $("#calendarSidebar")
      .stop(true, false)
      .css("overflow", "hidden")
      .animate({ width: 0 }, SIDEBAR_MS, "swing", function () {
        $(this).hide().attr("hidden", "hidden").css({ display: "none", overflow: "" });
        sidebarAnimating = false;
        $("#calendar").fullCalendar("option", "height", calHeight());
      });
    $("#mainContentDiv").stop(true, false).animate({ marginLeft: 0 }, SIDEBAR_MS, "swing");
    $("#sidebarOutBtnDiv").show().css("display", "block");
    $("#sidebarInBtnDiv").hide();
    $("body").removeClass("sidebar-open-mobile");
  }

  $("#sidebarToggleBtn").on("click", closeSidebar);
  $("#sidebarOpenBtn").on("click", openSidebar);

  // Panneau filtres : collapse Bootstrap (même durée / easing que Celcat)
  $("#browseBody").on("show.bs.collapse hide.bs.collapse", function () {
    $("#browseBtn i").toggleClass("fa-chevron-up fa-chevron-down");
  });

  // Dropdown code couleurs
  $("#colorKeyTitle").on("click", function (e) {
    e.preventDefault();
    $(this).closest(".dropdown").toggleClass("open");
  });
  $(document).on("click", function (e) {
    if (!$(e.target).closest("#ctColourKey .dropdown").length) {
      $("#ctColourKey .dropdown").removeClass("open");
    }
  });
})();
