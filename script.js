async function fetchVisitor() {
  const fetchData = await fetch("../선수제공파일/B_Module/visitors.json");
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

// 굿즈 판매 시작 //
async function getGoodsJson() {
  // 데이터 불러오기
  const a = await fetch(
    "../선수제공파일/B_Module/goods.json"
  );
  const b = await a.json();
  return b["data"];
}

async function testPrint() {
  // console.log("[  각 데이터별 출력  ]");
  // c.forEach((data) => console.log(data));

  console.log("[ GROUP 리스트 ]");
  const groupListParseData = await getGoodsJson();
  const groupList = [];
  groupListParseData.forEach((data) =>
    !groupList.includes(data.group) ? groupList.push(data.group) : null
  );
  console.log(groupList);

  console.log("[ 가격을 기준으로 오름차순 출력 ]");
  const priceDesc = await getGoodsJson();
  console.log(
    priceDesc.sort(
      (a, b) =>
        Number(a.price.replace(",", "")) - Number(b.price.replace(",", ""))
    )
  );

  console.log("[ 가격을 기준으로 내림차순 출력 ]");
  const priceAsc = await getGoodsJson();
  console.log(
    priceAsc.sort(
      (a, b) =>
        Number(b.price.replace(",", "")) - Number(a.price.replace(",", ""))
    )
  );

  console.log("[ 판매량을 기준으로 오름차순 출력 ]");
  const saleDesc = await getGoodsJson();
  console.log(saleDesc.sort((a, b) => a.sale - b.sale));

  console.log("[ 판매량을 기준으로 내림차순 출력 ]");
  const saleAsc = await getGoodsJson();
  console.log(saleAsc.sort((a, b) => b.sale - a.sale));

  console.log("[ GROUP 필터가 적용 된 데이터 출력 ]");
  const filter_if = "의류";
  const filter = await getGoodsJson();
  console.log(filter.filter((elem) => elem["group"] === filter_if));
}

const groups = [];
async function goodsInit() {
  const goods = await getGoodsJson();
  const viewOptionsElem = document.querySelector("#viewOptions");
  // 그룹 데이터 출력
  goods.forEach((data) => {
    if (!groups.includes(data.group)) {
      groups.push(data.group);
    }
  });
  groups.forEach((data) => {
    viewOptionsElem.innerHTML += `<label><input type="checkbox" name="${data}" onclick="updateGoodsList()" checked> ${data}<label>`;
  });
  updateGoodsList(); // 페이지 로드 시 최초 업데이트 1회 실행
}

async function updateGoodsList() {
  // 출력 그룹 여부
  const checkList = groups.filter(
    (data) => document.querySelector(`[name="${data}"]`).checked
  );

  // 선택된 그룹만 outputData에 저장
  const goodsJson = await getGoodsJson();
  const outputData = goodsJson.filter((goods) =>
    checkList.includes(goods.group)
  );

  // sortFilter(정렬 조건)에 따른 데이터 출력
  const sortFilter = document.querySelector("#sortFilter").value;
  switch (sortFilter) {
    // 가격 내림차순
    case "priceDesc":
      outputData.sort(
        (a, b) =>
          Number(b.price.replace(",", "")) - Number(a.price.replace(",", ""))
      );
      break;
    // 가격 오름차순
    case "priceAsc":
      outputData.sort(
        (a, b) =>
          Number(a.price.replace(",", "")) - Number(b.price.replace(",", ""))
      );
      break;
    // 판매량 내림차순
    case "sortDesc":
      outputData.sort((a, b) => b.sale - a.sale);
      break;
    // 판매량 오름차순
    case "sortAsc":
      outputData.sort((a, b) => a.sale - b.sale);
      break;
    default:
      break;
  }
  const goodsListElem = document.querySelector(`#goodsList`);
  const bestGoodsListElem = document.querySelector(`#bestGoodsList`);
  goodsListElem.innerHTML = ""; // 기존 리스트 초기화
  bestGoodsListElem.innerHTML = ""; // 기존 리스트 초기화
  for (let i = 0; i < outputData.length; i++) {
    // console.log(outputData[i]);
    if (i < 3) {
      bestGoodsListElem.innerHTML += `<div id="goods${
        outputData[i].idx
      }" class="card" style="width: 18rem;">
          <img src="../선수제공파일/B_Module/${
            outputData[i].img
          }" class="card-img-top" alt="...">
          <div class="card-body">
            <h5 class="card-title">[ BEST ] ${outputData[i].title}</h5>
            <p class="card-text">가격 : ${outputData[i].price}원</p>
            <p class="card-text">분류 : ${outputData[i].group}</p>
            <p class="card-text">판매량 : ${outputData[
              i
            ].sale.toLocaleString()}</p>
            <button class="btn btn-primary" onclick="goodsEdit(this)">수정제안</button>
          </div>
        </div>`;
    } else {
      goodsListElem.innerHTML += `
          <div id="goods${
            outputData[i].idx
          }" class="card" style="width: 18rem;">
          <img src="../선수제공파일/B_Module/${
            outputData[i].img
          }" class="card-img-top" alt="...">
          <div class="card-body">
            <h5 class="card-title">${outputData[i].title}</h5>
            <p class="card-text">가격 : ${outputData[i].price}원</p>
            <p class="card-text">분류 : ${outputData[i].group}</p>
            <p class="card-text">판매량 : ${outputData[
              i
            ].sale.toLocaleString()}</p>
            <button class="btn btn-primary" onclick="goodsEdit(this)">수정제안</button>
          </div>
        </div>
        `;
    }
  }
}
