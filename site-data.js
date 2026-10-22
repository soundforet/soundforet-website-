/* Generated from the public SQLite content by export_static.py. */
window.SOUNDFORET_STATIC_DATA = {"settings":{"hero_title":"필요한 음악을,\n목적에 맞게 만듭니다.","hero_description":"작사와 작곡, 편곡을 중심으로 광고와 영상, 게임, 이벤트, 개인 창작을 위한 음악을 기획하고 제작합니다. 프로젝트의 목적과 분위기에 맞는 음악을 함께 완성합니다.","about_lead":"Sound Foret은 음악이 필요한 사람과 프로젝트를 위해 곡을 만들고 음악을 설계합니다.","about_description":"작사와 작곡부터 편곡, 콘텐츠에 맞는 음악 제작까지 각 프로젝트의 목적과 방향을 고려해 작업합니다.","service_1_title":"작사 · 작곡","service_1_description":"가사, 멜로디 또는 간단한 아이디어를 바탕으로 보컬곡과 연주곡을 완성합니다.","service_2_title":"편곡 · 음악 제작","service_2_description":"기존 곡의 악기와 분위기를 목적에 맞게 바꿉니다. 데모 구성과 믹싱·마스터링은 필요에 따라 협의합니다.","service_3_title":"맞춤형 음악","service_3_description":"축가, 프러포즈·기념일, 가족과 행사를 위한 사연이 담긴 노래를 제작합니다.","service_4_title":"광고 · 브랜드 음악","service_4_description":"광고·브랜드 영상, 징글, 기업 콘텐츠와 매장·공간에 맞는 음악을 기획합니다.","service_5_title":"영상 · 게임 · 콘텐츠 음악","service_5_description":"게임·영상·유튜브·팟캐스트·애니메이션 음악을 제작합니다. 전시·행사·공연은 범위를 협의합니다.","works_title":"음악으로 완성할\n프로젝트를 기다립니다.","works_intro":"실제 작업 사례가 준비되면\n이곳에 소개합니다.","contact_title":"프로젝트에 대해\n이야기해 주세요.","contact_description":"만들고 싶은 음악과 사용 목적을 알려 주세요. 프로젝트의 방향과 필요한 작업 범위를 확인할 수 있도록 안내합니다.","footer_copy":"음악이 필요한 순간에, 목적에 맞는 음악을 만듭니다."},"projects":[{"id":"d2d258de-836a-4783-84a1-a6f30a5846a5","title":"잣대","category":"ORIGINAL MUSIC","description":"잣대","image":"assets/uploads/6404fcdc8be8c7e0a49ef0189970c4cf.jpg","year":"2021","link":"https://www.youtube.com/watch?v=qUgHXgO8dPs&list=PLQUrhTrtv6I0","published":true,"position":0,"show_on_home":true,"home_position":0},{"id":"0c4d8501-f1dc-4699-9dfa-ee1fe540bc96","title":"매달 나온 월급명세서에서 남은 젊음을 헤아려야 했던 시절","category":"ORIGINAL MUSIC","description":"매달 나온 월급명세서에서 남은 젊음을 헤아려야 했던 시절","image":"","year":"","link":"https://www.youtube.com/watch?v=QmDpfQ1Is-g&list=OLAK5uy_kASBTbRzskzfaGxBsPDBh1HAGZqJqgp9s","published":true,"position":1,"show_on_home":true,"home_position":1}],"homeProjects":[{"id":"d2d258de-836a-4783-84a1-a6f30a5846a5","title":"잣대","category":"ORIGINAL MUSIC","description":"잣대","image":"assets/uploads/6404fcdc8be8c7e0a49ef0189970c4cf.jpg","year":"2021","link":"https://www.youtube.com/watch?v=qUgHXgO8dPs&list=PLQUrhTrtv6I0","published":true,"position":0,"show_on_home":true,"home_position":0},{"id":"0c4d8501-f1dc-4699-9dfa-ee1fe540bc96","title":"매달 나온 월급명세서에서 남은 젊음을 헤아려야 했던 시절","category":"ORIGINAL MUSIC","description":"매달 나온 월급명세서에서 남은 젊음을 헤아려야 했던 시절","image":"","year":"","link":"https://www.youtube.com/watch?v=QmDpfQ1Is-g&list=OLAK5uy_kASBTbRzskzfaGxBsPDBh1HAGZqJqgp9s","published":true,"position":1,"show_on_home":true,"home_position":1}],"categories":["ORIGINAL MUSIC","CUSTOM SONG","VIDEO & GAME","BRAND & EVENT"]};
(() => {
  const originalFetch = window.fetch.bind(window);
  window.fetch = (input, options) => {
    const requestUrl = typeof input === 'string' ? input : input.url;
    if (requestUrl === '/api/site') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(window.SOUNDFORET_STATIC_DATA) });
    }
    return originalFetch(input, options);
  };
  document.addEventListener('submit', event => {
    if (event.target?.id !== 'contactForm') return;
    const form = event.target;
    const emailInput = form.elements.email;
    const phoneInput = form.elements.phone;
    const hasReplyAddress = Boolean(emailInput.value.trim() || phoneInput.value.trim());
    emailInput.setCustomValidity(hasReplyAddress ? '' : '이메일 또는 휴대폰 번호 중 하나를 입력해 주세요.');
    if (!form.reportValidity()) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    const status = form.querySelector('.form-status');
    const fields = [
      ['프로젝트 제목', 'project_title'], ['이름 또는 업체명', 'name'], ['이메일', 'email'],
      ['휴대폰 번호', 'phone'], ['문의 유형', 'type'], ['음악 사용 목적', 'purpose'],
      ['희망 일정', 'schedule'], ['예산', 'budget'], ['상세 내용', 'message'], ['참고 링크', 'reference'],
    ];
    const values = new FormData(form);
    const subject = '[Sound Foret 프로젝트 문의]' + (values.get('project_title') ? ' ' + values.get('project_title') : '');
    const body = fields.map(([label, name]) => `${label}: ${values.get(name) || '-'}`).join('\n');
    status.textContent = '메일 앱에서 내용과 받는 주소를 확인한 뒤 직접 보내 주세요. 홈페이지는 발송 여부를 확인하지 않습니다.';
    status.classList.remove('is-success');
    status.classList.add('is-error');
    window.location.href = `mailto:contact@soundforet.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, true);
})();
