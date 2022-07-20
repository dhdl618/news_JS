let searchButton = document.getElementById("search-button")
let menuButtons = document.querySelectorAll(".menu button")
menuButtons.forEach((menu)=>menu.addEventListener("click", (e)=>getNewsByTopic(e))) 
//익명 함수를 이용하였기에 getNewsByKeyword 함수와 달리 호이스팅 문제가 일어나지 않음


let url
let page = 1
let totalPages = 0

// api 호출 함수
const getNews = async () => {
    //try catch를 이용하여 에러가 발생했을 때, 에러메시지를 화면에 출력
  try {
    let header = new Headers({
      "x-api-key": "plK_KpdojqVYKtx2GnJxMMsuSrgL4R6ki6XAOeO4XUY",
    });

    url.searchParams.set('page', page) // &page=${page} 를 추가한다는 코드

    //ajax (서버와 주고받는 방법)
    let response = await fetch(url, { headers: header });
    //함수에 async를 적용, await으로 데이터를 비동기적으로 실행

    //json (서버통신에서의 자료형타입(text타입) - 객체와 비슷)
    let data = await response.json();

    if(response.status == 200){
        if(data.total_hits == 0) {
            throw new Error("검색된 결과가 없습니다.")
        }
        news = data.articles;
        page = data.page
        totalPages = data.total_pages
        console.log(data)
        
        render()
        pagination(totalPages)
    } else if(response.status == 429) {
        throw new Error("검색 빈도가 잦습니다.<br/>잠시 후 다시 시도해주세요.")
    } else if(response.status == 406) {
        throw new Error("검색어가 입력되지 않았습니다.")
    } else {
        throw new Error(data.message)
    }

  } catch (error) {
    errorRender(error.message)
    console.log("잡힌 에러는", error.message);
  }
};


const errorRender = (message) => {
    let errorHtml = `<div class="alert alert-danger text-center">${message}</div>`
    
    // html 파일의 news-board 아이디를 가진 태그에 추가
    document.getElementById("news-board").innerHTML = errorHtml
}


// 첫 api 호출 함수
const getLatestNews = async() => {
    //js에서 제공하는 URL 클래스타입 (클래스타입은 new 사용)
    url = new URL(`https://api.newscatcherapi.com/v2/latest_headlines?countries=KR&topic=sport&page_size=5`)
    
    getNews()
}


//클릭한 Menu와 관련된 뉴스 가져오는 함수
const getNewsByTopic = async(e) => {
    let topic = e.target.textContent.toLowerCase();
    url = new URL(`https://api.newscatcherapi.com/v2/latest_headlines?countries=KR&topic=${topic}&page_size=5`)
    page = 1    // page를 1로 초기화 해줌으로써, 다른 카테고리를 클릭할 때 1페이지로 이동

    getNews()
}

let news = []


// 검색 키워드 읽어와서 url에 적용, 헤더 url 부르고 데이터 가져온 후 렌더링
const getNewsByKeyword = async() => {
    let keyword = document.getElementById("search-input").value
    url = new URL(`https://api.newscatcherapi.com/v2/search?q=${keyword}&countries=KR&page_size=5`)
    page = 1

    getNews()
}

searchButton.addEventListener("click", getNewsByKeyword)
// 호이스팅 문제 해결을 위해 함수를 먼저 정의한 후, 호출


// 렌더링 함수
const render = () => {
    let newsHTML = ''

    // 출력 글자가 100자 이상이면 ... 출력
    // let summaryText = ''
    // summaryText += news.map((item) => {
    //     for(let i=0; i<item.summary; i++) {
    //         if(item.summary.length > 100) {
    //             return item.summary.substr(0,100)+"..."
    //         }
    //     }
    // })

    newsHTML += news.map((item)=>{                 //map 함수는 리턴값이 array
        return `<div class="row news"> 
        <div class="col-lg-4">
            <img class="news-img" src="${item.media}">
        </div>
        <div class="col-lg-8">
            <h2>${item.title}</h2>
            <p>${item.summary}</p>
            <div>
                ${item.published_date} [${item.rights}]
            </div>
        </div>
    </div>`
    }).join('')             //배열 > string으로 변환하여 (,)가 생기는걸 방지

    document.getElementById("news-board").innerHTML = newsHTML
}


// 페이지 버튼 출력
const pagination = (totalPageNum) => {
    totalPages = totalPageNum

    console.log("총 페이지 수는",totalPages,"페이지")

    let paginationHtml = ''
    // 현재 페이지를 5로 나눈 값에 올림(ceil)
    let pageGroup = Math.ceil(page/5) 
    // 각 그룹의 마지막 페이지 ([1~5] 중 [5], [6~10] 중 [10] ...)
    let lastPage = pageGroup * 5  
    // 각 그룹의 첫번째 페이지 ([1~5] 중 [1], [6~10] 중 [6] ...)
    let firstPage = lastPage - 4

    // 총 페이지 수에서 그룹의 첫번째 페이지를 뺀 값이 4보다 작으면 
    // 총 페이지가 딱 5로 떨어지지 않기에 마지막 페이지그룹은 5개가 출력되지 않는다.
    // 따라서 4보다 작을 때, 총 페이지 수에서 4를 뺐을 때, 음수가 나오면 
    // 첫번째 페이지는 1로 지정을 하고 음수가 아닐 경우, 총 페이지에서 4를 뺀 값을
    // 첫번째 페이지로 지정하여 마지막 페이지에 맞춰서 5개가 출력될 수 있도록 한다.
    if((totalPages - firstPage) < 4) {
        if(totalPages - 4 <= 0) {
            firstPage = 1
        } else {
            firstPage = totalPages - 4
        }
    }

    // 페이지가 5페이지 이하일 경우,
    if(lastPage > totalPages) {
        lastPage = totalPages
    }

    console.log(firstPage)
    console.log(lastPage)

    // 첫번째 페이지가 6보다 크면 즉, 페이지그룹이 2 이상일 때, [<] [<<] 를 보여주고
    // 그룹이 1개밖에 없을 경우, [<] [<<] 를 보여주지 않는다. 
    if (firstPage >= 6) {
      // 맨 앞 페이지 (<<)
      paginationHtml = `<li class="page-item">
    <a class="page-link" href="#" aria-label="Previous" onClick="movePage(1)">
      <span aria-hidden="true" class="side-btn">&laquo;</span>
    </a>
  </li>`;

      // 이전 페이지 (<)
      paginationHtml += `<li class="page-item">
    <a class="page-link" href="#" aria-label="Previous" onClick="movePage(page - 1)">
      <span aria-hidden="true">&lt;</span>
    </a>
  </li>`;
    }

    // 페이지를 5개씩 보여주는 for문이다.
    for(let i=firstPage; i<=lastPage; i++) {
        paginationHtml += `<li class="page-item ${page==i?"active":""}">
        <a class="page-link" href="#" onClick="movePage(${i})">${i}</a>
        </li>`
    }

    // 마지막 페이지가 총 페이지보다 작으면 [>] [>>] 를 보여주고
    // 총 페이지보다 크면 즉, 마지막 페이지 그룹일 경우 [>] [>>] 를 보여주지 않는다.
    if (lastPage < totalPages) {
      // 다음 페이지
      paginationHtml += `<li class="page-item">
    <a class="page-link" href="#" aria-label="Next" onClick="movePage(page + 1)">
      <span aria-hidden="true">&gt;</span>
    </a>
  </li>`;

      // 맨 뒤 페이지
      paginationHtml += `<li class="page-item">
    <a class="page-link" href="#" aria-label="Previous" onClick="movePage(totalPages)">
      <span aria-hidden="true" class="side-btn">&raquo;</span>
    </a>
  </li>`;
    }

    document.querySelector(".pagination").innerHTML = paginationHtml
}

// 페이지 이동버튼
const movePage = (pageNum) => {
    if(pageNum < 1) {
        page = 1
    } else if(pageNum > totalPages) {
        page = totalPages
        console.log(totalPages)
    } else {
        page = pageNum
    }

    getNews()
}

let concealButton = document.getElementById("conceal-input")
let input = document.getElementById("search-input")
let concealInput = true

// 초기화
input.style.display = "none"
searchButton.style.display = "none"
input.addEventListener("focus", () => {
  input.value = ""
})

const revealAndConcealButton = () => {

  switch (concealInput) {
    case true:
      input.style.display = ""
      searchButton.style.display = ""
      concealInput = false
      break
      
    case false:
      input.style.display = "none"
      searchButton.style.display = "none"
      concealInput = true
      break
  }
  console.log(concealInput)
}

concealButton.addEventListener("click", revealAndConcealButton)


getLatestNews()