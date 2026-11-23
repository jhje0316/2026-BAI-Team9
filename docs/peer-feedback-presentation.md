# AI Anti-Counterfeit Solution

AI and Business · 9조 · 5분 발표

*[발표 전] 두 버전을 영어로 맞추고 `AJOU-SYN-001`을 선택한다. 변경점 표시를 끈 채 [이전 버전](http://127.0.0.1:4173/before) 상단에서 시작한다. 영어만 읽으면 시연을 포함해 약 5분이다. 한국어는 문장 바로 아래에 두었다.*

## 0:00–0:40 · 제품 소개

Hi everyone, we're Team 9.\
안녕하세요, 9조입니다.

When a fashion brand reviews overseas listings, someone has to read the local wording, find the original product, and check the price.\
패션 브랜드가 해외 판매 글을 검토하려면 현지어 설명을 읽고, 정품을 찾아 가격을 비교해야 합니다.

With several cases open at once, where do you start?\
그런 글이 한꺼번에 여러 건 들어오면 어디서부터 봐야 할까요?

Our AI anti-counterfeit solution helps with that first review.\
저희가 만든 AI 위조상품 대응 솔루션은 그 첫 검토를 돕습니다.

It compares listings with the brand's catalog and shows which cases to look at first.\
판매 글을 브랜드 카탈로그와 비교해 어떤 건부터 살펴볼지 보여줍니다.

The reviewer decides whether to investigate further or close the case as a legitimate sale.\
담당자는 더 조사할지, 정상 판매로 보고 검토를 끝낼지 결정합니다.

## 0:40–1:35 · 피드백 전 화면

*[시연] 스페인 사례의 고위험 표시를 가리키고 시각 비교까지 내려간다.*

Here's the original version.\
먼저 이전 버전입니다.

This Spanish listing offers a bag that looks like the AJOU shoulder bag for 45 euros, against a reference price of 290.\
스페인 판매 글에서는 AJOU 숄더백과 닮은 가방을 45유로에 팔고 있습니다. 기준가는 290유로입니다.

The seller calls it a “one-to-one replica.”\
판매자는 ‘1대 1 레플리카’라고 적었습니다.

The tool marks the case as high risk.\
화면에는 고위험으로 표시됩니다.

The listing is on the left and the catalog reference is on the right.\
왼쪽은 판매 글의 상품이고, 오른쪽은 카탈로그 기준 상품입니다.

You can compare the logo and shape, and see the visual similarity score of 0.42.\
로고와 가방 모양을 비교할 수 있고, 시각 유사도는 0.42로 나옵니다.

*[시연] **Pre-Filled Takedown Summary**로 내려간다.*

The tool also filled in an editable draft.\
아래에는 담당자가 수정할 수 있는 초안이 자동으로 채워져 있습니다.

This one said the seller had used the brand without permission and asked for immediate removal.\
이 초안은 판매자가 브랜드를 무단으로 사용했다고 쓰고, 상품을 즉시 내려 달라고 요청했습니다.

We gave Team 4 this case to review.\
저희는 이 사례를 4조에 검토해 달라고 했습니다.

## 1:35–2:25 · 4조 피드백

*[시연] 상단의 **변경점 표시**를 켜고 다섯 항목을 보여준다.*

Team 4 liked the side-by-side comparison and knew where the reviewer made the final decision.\
4조는 상품을 나란히 보기 편하고 담당자가 어디서 최종 결정을 내리는지도 알기 쉽다고 했습니다.

They asked what 0.42 meant and how it affected the high-risk rating.\
그리고 0.42가 무슨 뜻인지, 그 점수가 고위험 판정에 어떻게 반영됐는지 물었습니다.

Then they looked at the draft.\
그다음에는 초안을 봤습니다.

They felt that asking for immediate removal was too strong while the reviewer still had things to check.\
담당자가 더 확인할 내용이 있는데 바로 삭제를 요청하는 표현은 너무 강하다고 했습니다.

They also pointed out that a seller outside the official list could be reselling a genuine item.\
공식 판매자 목록에 없는 사람도 정품을 중고로 팔 수 있다는 점을 짚었습니다.

*[시연] 목록의 **4번 초안에 넣을 근거 선택**을 펼친다.*

Their most specific request was to let the reviewer choose exactly what went into the draft.\
가장 구체적인 요청은 초안에 넣을 근거를 담당자가 직접 고르게 해 달라는 것이었습니다.

We built the updated review around that choice.\
저희는 그 선택을 중심으로 검토 화면을 다시 구성했습니다.

## 2:25–3:25 · 개선된 판정과 설명

*[시연] **최신 버전**으로 바꾸고 오른쪽 목록을 닫는다. **Show sample AI result**와 **Threshold Rubric**을 차례로 누른다.*

Here's the same Spanish case in the updated version.\
최신 버전에서 같은 스페인 사례를 보겠습니다.

The rating and the recommended action are together at the top.\
위험 등급과 다음 조치가 맨 위에 함께 나옵니다.

This case is high risk, and the tool recommends a hold for verification.\
이 사례는 고위험이고, 권고 조치는 추가 검증 보류입니다.

The sample result opens the reasoning for this case.\
예시 AI 결과를 열면 이 사례의 판단 이유를 볼 수 있습니다.

The criteria are one click away.\
버튼을 누르면 판정 기준도 바로 나옵니다.

This listing hits all three signals.\
이 판매 글에는 세 가지 신호가 모두 잡혔습니다.

It uses replica wording, the new item is priced far below the reference, and the visual similarity is low.\
레플리카 문구가 있고, 새 상품인데도 기준가보다 훨씬 저렴하고, 시각 유사도도 낮습니다.

Two of those signals are enough for a high-risk rating.\
이 가운데 두 가지 이상이면 고위험으로 분류합니다.

The similarity scale runs from zero to one, with lower scores meaning the products look less alike.\
유사도는 0에서 1 사이로 읽고, 낮을수록 두 상품이 덜 닮았다는 뜻입니다.

For a used item, the review also considers resale clues such as a receipt or signs of wear.\
중고 상품을 볼 때는 영수증이나 사용 흔적 같은 재판매 단서도 살핍니다.

## 3:25–4:40 · 근거 선택과 보류 결정

*[시연] **변경 목록**에서 4번 **화면에서 보기**를 누르고 Esc로 설명을 닫는다. 여섯 항목에 **Reviewed**를 체크하고, **Listing wording**과 **Price deviation**만 **Include in draft**에 체크한다.*

Now I'll review the case myself.\
이제 제가 담당자라면 어떻게 검토할지 보여드리겠습니다.

Of these six items, I'll put the listing wording and the price difference into the draft.\
여섯 항목 중 판매 글에 적힌 문구와 가격 차이만 초안에 넣겠습니다.

A discount could explain the price, so I'll take that item out.\
할인 때문에 가격이 낮을 수도 있으니, 가격 근거를 빼 보겠습니다.

*[시연] **Price deviation**의 포함 체크를 해제한다. **Preview selected evidence package**를 열어 문구가 남은 것을 보여주고 닫는다.*

Both prices disappear from the draft and the preview.\
초안과 미리보기에서 두 금액이 모두 사라집니다.

What's left is the seller's wording and what we want someone to check.\
이제는 판매자가 쓴 문구와 담당자가 확인할 내용이 남습니다.

In this case, I'd check what the phrase means locally and confirm the rights record for that market.\
이 사례에서는 현지에서 그 문구가 어떤 뜻으로 쓰이는지, 해당 시장의 권리 기록은 어떤지 확인하겠습니다.

*[시연] 선택 확인에 체크하고 **Decision rationale**에 `Check the local wording and the rights record for this market.`을 입력한다. **Hold for Verification**을 누르고 기록에서 **Selected evidence and draft snapshot**을 펼친다.*

When I record the hold, the tool saves my reason, my evidence choices, and the draft as it looked at that moment.\
보류를 누르면 판단 사유와 고른 근거, 당시 초안이 함께 기록됩니다.

## 4:40–5:00 · 마무리

Team 4 helped us turn a risk label into a clear next step.\
4조의 피드백 덕분에 위험 등급을 본 뒤 무엇을 할지 더 분명해졌습니다.

The reviewer can see why a case comes first, choose what goes into the draft, and leave a record of what needs to be checked.\
담당자는 왜 이 건을 먼저 봐야 하는지 확인하고, 초안에 넣을 근거를 고르고, 다음에 확인할 내용을 기록할 수 있습니다.

Thank you.\
감사합니다.
