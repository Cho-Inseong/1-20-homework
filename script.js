async function fetchVisitor() {
    const fetchData = await fetch(
      "../선수제공파일/B_Module/visitors.json"
    );
    const parseData = await fetchData.json();
    return parseData["data"];
  }

  function updateChartAndTable(visitorsData, leagueName, day, orientation) {
    const league = visitorsData.find((l) => l.name === leagueName);
    const dayData = league.visitors.find((d) => d.day === day);
    const visitorData = dayData.visitor;
  
    // 표 업데이트
    $("#visitorTable").empty();
    $("#visitorTable").append(
      `<thead><tr><th>시간대</th><th>방문자 수</th></tr></thead>`
    );
    const tbody = $("<tbody></tbody>");
    for (const [time, count] of Object.entries(visitorData)) {
      tbody.append(`<tr><td>${time}</td><td>${count}</td></tr>`);
    }
    $("#visitorTable").append(tbody);
  
    // 차트 업데이트
    $("#chartArea").empty();
    if (orientation === "horizontal") {
      const chartContainer = $("<div></div>");
      Object.entries(visitorData).forEach(([time, count]) => {
        const percentage = (count / 500) * 100;
        const bar = $(`
              <div class="d-flex align-items-center" style="margin-bottom: 10px;">
                  <div style="width: ${percentage}%; min-width: 20px; height: 20px; background-color: #007bff; color: white;">${count}</div>
                  <span class="ml-2">${time}</span>
              </div>
          `);
        chartContainer.append(bar);
      });
      $("#chartArea").css({
        display: "block",
      });
      $("#chartArea").append(chartContainer);
    } else {
      const chartContainer = $(
        "<div class='d-flex align-items-end' style='height: 200px;'></div>"
      );
      Object.entries(visitorData).forEach(([time, count]) => {
        const barHeight = (count / 500) * 200;
        const bar = $(`
              <div class="d-flex flex-column align-items-center" style="margin-right: 10px;">
              <div class="bar" style="width: 50px; height: ${barHeight}px; background-color: #007bff; color: white; display: flex; align-items: flex-end; justify-content: center;">${count}</div>
              <span>${time}</span>
              </div>
          `);
        chartContainer.append(bar);
      });
      $("#chartArea").css({
        display: "flex",
        "justify-content": "center",
        "text-align": "center",
      });
      $("#chartArea").append(chartContainer);
    }
  }
  
  async function initBaseballParkChart() {
    const visitorsData = await fetchVisitor();
  
    visitorsData.forEach((league) => {
      $("#leagueSelect").append(new Option(league.name, league.name));
    });
  
    const days = ["월", "화", "수", "목", "금", "토", "일"];
    days.forEach((day) => {
      $("#daySelect").append(new Option(day, day));
    });
  
    $("#leagueSelect, #daySelect, #chartOrientation")
      .change(function () {
        const selectedLeague = $("#leagueSelect").val();
        const selectedDay = $("#daySelect").val();
        const orientation = $("#chartOrientation").val();
        updateChartAndTable(
          visitorsData,
          selectedLeague,
          selectedDay,
          orientation
        );
      })
      .change();
  }