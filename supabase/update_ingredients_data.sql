
-- Ensure column exists first
ALTER TABLE public.finished_goods ADD COLUMN IF NOT EXISTS ingredients TEXT;

-- Update ingredients for 관절N칼슘부스팅젤리 (Broad match)
UPDATE public.finished_goods
SET ingredients = '정제수(63.6786%), 알룰로오스(20.00%), 자일리톨(5.00%), 칼슘(고시형)(3.18182%), NAG(엔에이지, N-아세틸글루코사민)(2.63158%), 기타가공품(1.80%), 글루콘산마그네슘(고시형)(1.00%), 쌍화향(0.50%), 참당귀농축액(0.50%), 대추농축액(0.50%), 쌍화농축액(0.50%), 구연산(무수)(0.40%), 효소처리스테비아(0.18%), 구연산삼나트륨(0.10%), 수크랄로스(0.02%), 비타민D3혼합제제분말(0.008%)'
WHERE product_name LIKE '%관절%N%칼슘%';

-- Update ingredients for 한동키즈튼튼 맑은숨 녹용 (Broad match)
UPDATE public.finished_goods
SET ingredients = '액상차[작두콩추출액](70.285%), 프락토올리고당(20.00%), 액상차[수세미추출액](5.00%), 쌀조청[조청쌀엿](2.00%), 딸기농축액(1.00%), 기타가공품[녹용청명농축액](1.00%), 팔라티노스(0.50%), 액상차[매실농축액N](0.173%), 효모식품(0.042%)'
WHERE product_name LIKE '%맑은숨%';

-- Update ingredients for 뉴질랜드 아오테아로아 녹용
UPDATE public.finished_goods
SET ingredients = '동식물혼합추출물[녹용식물혼합추출물](95.00%), 배농축액(2.95%), 대추농축액(2.00%), 홍삼농축액(0.05%)'
WHERE product_name LIKE '%뉴질랜드%녹용%';

-- Update ingredients for 러시아 알타이 녹용
UPDATE public.finished_goods
SET ingredients = '동식물혼합추출물(95.00%), 대추농축액(2.95%), 배농축액(2.00%), 홍삼농축액(0.05%)'
WHERE product_name LIKE '%러시아%녹용%';

-- Update ingredients for 진심명품환
UPDATE public.finished_goods
SET ingredients = '벌꿀(38.99%), 녹용분말(12.00%), 참당귀분말(12.00%), 산수유분말(12.00%), 건지황분말(11.50%), 홍삼분말(11.50%), 천연향료(Civet)(2.00%), 금박(0.01%)'
WHERE product_name LIKE '%진심명품환%';

-- Update ingredients for 한동 키즈튼튼 녹용칼슘스틱
UPDATE public.finished_goods
SET ingredients = '정제수(54.2823%), 프락토올리고당(20.00%), 과.채가공품[나타드코코](10.00%), 기타가공품[녹용추출분말](5.00%), 구연산칼슘(3.00%), 혼합제제[검 베이스 혼합제제](2.60%), 구연산(무수)(1.70%), 유청칼슘[밀크칼슘](1.68%), 향료[요구르트향](1.20%), 염화칼슘(0.30%), 효소처리스테비아(0.17%), 수크랄로스(0.055%), 당류가공품[요구르트 혼합](0.01%), 산화아연(0.0027%)'
WHERE product_name LIKE '%녹용칼슘스틱%';

-- Update ingredients for 한동녹용 더한 흑도라지청 (Broad match)
UPDATE public.finished_goods
SET ingredients = '쌀조청(48.00%), 액상차[흑도라지농축액](37.48%), 도라지뿌리[도라지](9.80%), 도라지뿌리분말[흑도라지 분말](3.00%), 액상차[BD혼합농축액](1.40%), 추출가공식품[녹용추출액](0.25%), 자몽종자추출물(0.05%), l-멘톨(0.02%)'
WHERE product_name LIKE '%흑도라지청%';

-- Update ingredients for 한동효력환 (Matches 10환, 30환, etc.)
UPDATE public.finished_goods
SET ingredients = '사양벌꿀(45.00%), 건조효모[건조맥주효모](8.00%), 산수유열매(8.00%), 참당귀뿌리(8.00%), 녹용(4.00%), 녹각(3.00%), 홍삼(3.00%), 쇠무릎뿌리[우슬](3.00%), 지황포제가공한뿌리[숙지황](3.00%), 복령균핵[복령](3.00%), 마뿌리(3.00%), 감초(2.00%), 율무쌀[율무](2.00%), 대추(2.00%), 원지뿌리[원지](1.00%), 침향나무수지가침착된수간목[침향](1.00%), 혼합제제[비타민미네랄믹스](0.50%), L-아르지닌(0.50%)'
WHERE product_name LIKE '%효력환%';
