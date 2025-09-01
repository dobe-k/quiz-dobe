# Quiz Share - 퀴즈 공유 플랫폼

퀴즈를 공유하고 온라인에서 풀 수 있는 경량 웹 애플리케이션입니다.

## 🎯 기능

- 📱 **모바일 최적화**: 모든 기기에서 완벽하게 작동
- 🎨 **직관적 UI**: 깔끔하고 사용하기 쉬운 인터페이스
- ⚡ **빠른 로딩**: 경량 설계로 빠른 페이지 로드
- 🔗 **URL 기반 공유**: 링크만으로 퀴즈 공유 가능
- 📊 **실시간 피드백**: 즉시 확인하는 정답/오답
- 🏆 **상세한 결과**: 점수, 정답률, 리뷰 기능

## 🛠️ 기술 스택

- **HTML5**: 구조화된 마크업
- **CSS3**: 모던 스타일링 및 애니메이션
- **Vanilla JavaScript**: 퓨어 자바스크립트로 최적화
- **GitHub Pages**: 무료 호스팅

## 🚀 사용 방법

### URL 형식
```
https://dobe-k.github.io/quiz-dobe/?quiz=[Base64_인코딩된_퀴즈_데이터]
```

### 퀴즈 데이터 형식
```json
{
  "title": "퀴즈 제목",
  "description": "퀴즈 설명",
  "difficulty": "easy|medium|hard",
  "quizzes": [
    {
      "question": "질문 내용",
      "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
      "correctAnswer": 0
    }
  ]
}
```

## 📱 화면 구성

1. **로딩 화면**: 퀴즈 데이터 로드
2. **시작 화면**: 퀴즈 미리보기 및 시작
3. **퀴즈 화면**: 문제 풀이 인터페이스
4. **결과 화면**: 점수 및 통계 표시
5. **리뷰 화면**: 정답 확인 및 해설

## 🔧 개발자 가이드

### 로컬 개발
```bash
# 레포지토리 클론
git clone https://github.com/dobe-k/quiz-dobe.git
cd quiz-dobe

# 로컬 서버 실행 (Python 3 기준)
python -m http.server 8000

# 브라우저에서 접속
open http://localhost:8000
```

### GitHub Pages 설정
1. GitHub 레포지토리 설정
2. Settings → Pages
3. Source: "Deploy from a branch"
4. Branch: main, / (root)
5. Save

### 디버깅
브라우저 콘솔에서 `debugQuiz()` 함수를 호출하여 현재 상태 확인:
```javascript
debugQuiz(); // 퀴즈 데이터, 사용자 답안, 점수 등 출력
```

## 🔗 메인 앱과의 연동

이 프로젝트는 독립적으로 작동하지만, 다른 퀴즈 제너레이터와 연동할 수 있습니다:

1. **퀴즈 데이터 준비**: 위 JSON 형식으로 데이터 구성
2. **Base64 인코딩**: `btoa(JSON.stringify(quizData))`
3. **URL 생성**: `https://dobe-k.github.io/quiz-dobe/?quiz=${encodedData}`
4. **공유**: 생성된 URL을 복사/공유

## 📊 성능 최적화

- 🏃 **경량 설계**: 외부 라이브러리 최소화
- 🎨 **CSS 애니메이션**: 부드러운 사용자 경험
- 📱 **반응형 디자인**: 모든 화면 크기 지원
- ⚡ **빠른 렌더링**: Vanilla JS로 최적화

## 🤝 기여하기

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 공개됩니다.

## 🌟 데모

실제 작동 예시: [Demo Link](https://dobe-k.github.io/quiz-dobe/)

---

💡 **Tip**: 퀴즈 URL이 너무 긴 경우 URL 단축 서비스를 사용하는 것을 권장합니다.