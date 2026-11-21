// ==UserScript==
// @name         Edupia Tutor - Tự Động Đánh Giá Buổi Học (v13.0 - Key Enforced)
// @namespace    https://edupiatutor.vn/
// @version      13.0
// @description  Bắt buộc API Key cá nhân, cúp hiển thị dưới tên, nhận xét tự nhiên chuẩn sư phạm
// @author       Rowan (RW)
// @match        https://lms.edupiatutor.vn/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    const EMBEDDED_API_KEY = "";

    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes modalFadeIn {
            from { opacity: 0; transform: scale(0.97) translateY(8px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .ui-card-option {
            flex: 1;
            border: 1px solid #e5e7eb;
            background: #ffffff;
            padding: 16px;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .ui-card-option:hover {
            border-color: #d1d5db;
        }
        .ui-card-option.active {
            border: 2px solid #111827 !important;
            background: #fafafa;
        }
        .ui-score-chip {
            padding: 5px 12px;
            font-size: 13px;
            font-weight: 500;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            background: #ffffff;
            color: #374151;
            cursor: pointer;
            transition: all 0.15s ease;
        }
        .ui-score-chip:hover {
            background: #f3f4f6;
        }
        .ui-score-chip.active {
            background: #111827 !important;
            color: #ffffff !important;
            border-color: #111827 !important;
        }
        .ui-role-chip {
            padding: 3px 10px;
            font-size: 12px;
            font-weight: 500;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
            background: #ffffff;
            color: #4b5563;
            cursor: pointer;
            transition: all 0.15s ease;
        }
        .ui-role-chip.active {
            background: #111827 !important;
            color: #ffffff !important;
            border-color: #111827 !important;
        }
        .ui-btn-black {
            background: #111827;
            color: #ffffff;
            border: none;
            padding: 13px 20px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            transition: all 0.2s ease;
        }
        .ui-btn-black:hover {
            background: #1f2937;
        }
        .ui-btn-black:active {
            transform: scale(0.99);
        }
        .ui-link-underline {
            font-size: 12px;
            color: #6b7280;
            cursor: pointer;
            text-decoration: underline;
            text-underline-offset: 3px;
            transition: color 0.15s ease;
        }
        .ui-link-underline:hover {
            color: #111827;
        }
    `;
    document.head.appendChild(style);

    const btn = document.createElement('button');
    btn.innerHTML = 'Tự động đánh giá';
    btn.style = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 999999;
        background: #111827;
        color: #ffffff;
        padding: 10px 18px;
        border-radius: 20px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.14), 0 1px 3px rgba(0, 0, 0, 0.08);
        font-weight: 500;
        font-size: 13.5px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        letter-spacing: -0.01em;
        display: none;
    `;
    btn.onmouseover = () => {
        btn.style.background = '#1f2937';
        btn.style.transform = 'translateY(-1px)';
    };
    btn.onmouseout = () => {
        btn.style.background = '#111827';
        btn.style.transform = 'translateY(0)';
    };
    document.body.appendChild(btn);

    const modal = document.createElement('div');
    modal.style = `
        display: none;
        position: fixed;
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        z-index: 1000000;
        justify-content: center;
        align-items: center;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif;
    `;

    modal.innerHTML = `
        <div style="background: #ffffff; border-radius: 16px; width: 510px; max-width: 92vw; padding: 26px; box-shadow: 0 20px 48px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04); border: 1px solid #e5e7eb; animation: modalFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1); max-height: 88vh; overflow-y: auto;">
            
            <!-- VIEW 1: FORM CẤU HÌNH -->
            <div id="viewForm">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px;">
                    <div style="width: 38px; height: 38px; border-radius: 10px; background: #111827; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.12);">
                        <span style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif; font-weight: 800; font-size: 15px; color: #ffffff; letter-spacing: -0.04em;">RW</span>
                    </div>
                    <button id="closeModal" style="background: none; border: none; font-size: 20px; color: #9ca3af; cursor: pointer; padding: 4px; line-height: 1;">&times;</button>
                </div>

                <div style="margin-bottom: 20px;">
                    <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #111827; letter-spacing: -0.02em;">Đánh giá buổi học</h3>
                    <div id="detectedTopic" style="font-size: 13px; color: #6b7280; margin-top: 4px;">Đang xác định chủ đề...</div>
                </div>

                <div style="display: flex; gap: 12px; margin-bottom: 18px;">
                    <div class="ui-card-option active" data-mode="all_10">
                        <div style="font-size: 14px; font-weight: 600; color: #111827;">Toàn bộ 10 điểm</div>
                        <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Áp dụng đồng đều cho cả lớp</div>
                    </div>
                    <div class="ui-card-option" data-mode="custom">
                        <div style="font-size: 14px; font-weight: 600; color: #111827;">Chấm điểm từng em</div>
                        <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Tùy chỉnh số điểm riêng biệt</div>
                    </div>
                </div>

                <div id="studentListContainer" style="display: none; margin-bottom: 18px; border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px; background: #fafafa;">
                    <div style="font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 10px;">Danh sách học sinh</div>
                    <div id="studentRows"></div>
                </div>

                <div style="margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 12px; color: #6b7280; font-weight: 500;">Xưng hô:</span>
                        <div style="display: flex; gap: 4px;" id="tutorRoleGroup">
                            <button type="button" class="ui-role-chip active" data-role="Cô">Cô</button>
                            <button type="button" class="ui-role-chip" data-role="Thầy">Thầy</button>
                        </div>
                    </div>
                    <span id="btnToggleApiKey" class="ui-link-underline">Thiết lập API Key</span>
                </div>

                <!-- Khung API Key -->
                <div id="apiKeyDrawer" style="display: none; margin-bottom: 18px; background: #f9fafb; padding: 14px; border-radius: 10px; border: 1px solid #e5e7eb;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-size: 12px; font-weight: 600; color: #374151;">Google Gemini API Key (Bắt buộc)</span>
                        <span id="apiStatusBadge" style="font-size: 11.5px; color: #6b7280;">Chưa cài đặt</span>
                    </div>
                    <input type="password" id="geminiApiKey" placeholder="Dán mã key AIzaSy... vào đây" style="width: 100%; box-sizing: border-box; padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; outline: none; background: white;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" style="color: #2563eb; font-size: 11px; text-decoration: underline;">Lấy mã key miễn phí tại đây ↗</a>
                        <button id="btnSaveKeyOnly" style="background: #111827; color: white; border: none; border-radius: 6px; padding: 5px 12px; font-size: 11.5px; cursor: pointer;">Lưu</button>
                    </div>
                </div>

                <div id="apiErrorMsg" style="display: none; color: #dc2626; font-size: 12px; text-align: center; margin-bottom: 12px; font-weight: 500;"></div>

                <button id="btnSubmit" class="ui-btn-black">
                    Tự động điền đánh giá
                </button>
            </div>

            <!-- VIEW 2: HOÀN TẤT ĐÁNH GIÁ -->
            <div id="viewSuccess" style="display: none; text-align: center; padding: 8px 0;">
                <div style="width: 48px; height: 48px; border-radius: 50%; background: #f4f4f5; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>

                <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #111827;">Hoàn tất đánh giá</h3>
                <p style="font-size: 13.5px; color: #4b5563; margin: 8px 0 20px 0; line-height: 1.5;">
                    Điểm số và nhận xét đã được cập nhật thành công vào tất cả các ô trong biểu mẫu.
                </p>

                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px; text-align: left; margin-bottom: 20px; font-size: 13px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: #6b7280;">Chủ đề buổi học:</span>
                        <span id="summaryTopic" style="font-weight: 600; color: #111827;">...</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: #6b7280;">Số học sinh:</span>
                        <span id="summaryStudents" style="font-weight: 600; color: #111827;">...</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #6b7280;">Trạng thái:</span>
                        <span style="font-weight: 600; color: #111827;">Đã điền hoàn tất</span>
                    </div>
                </div>

                <p style="font-size: 12px; color: #6b7280; margin: 0 0 20px 0; white-space: nowrap; text-align: center;">
                    Vui lòng kiểm tra lại thông tin và nhấn nút <strong>Lưu đánh giá</strong> ở cuối trang để hoàn tất.
                </p>

                <button id="btnCloseSuccess" class="ui-btn-black">
                    Đóng cửa sổ
                </button>
            </div>

        </div>
    `;
    document.body.appendChild(modal);

    let detectedStudents = [];
    let detectedTopic = 'Ôn tập và luyện tập kỹ năng';
    let currentMode = 'all_10';
    let currentTutorRole = GM_getValue('tutor_role', 'Cô');

    function checkCurrentPage() {
        const isFeedbackPage = window.location.href.includes('/statistics-report/edit');
        if (isFeedbackPage) {
            btn.style.display = 'block';
        } else {
            btn.style.display = 'none';
            modal.style.display = 'none';
        }
    }

    const originalPushState = history.pushState;
    history.pushState = function() {
        originalPushState.apply(this, arguments);
        setTimeout(checkCurrentPage, 100);
    };

    const originalReplaceState = history.replaceState;
    history.replaceState = function() {
        originalReplaceState.apply(this, arguments);
        setTimeout(checkCurrentPage, 100);
    };

    window.addEventListener('popstate', checkCurrentPage);
    setInterval(checkCurrentPage, 400);

    btn.onclick = () => {
        scanPageData();
        loadTutorRoleState();
        checkApiKeyDisplayState();
        modal.querySelector('#viewForm').style.display = 'block';
        modal.querySelector('#viewSuccess').style.display = 'none';
        modal.style.display = 'flex';
    };
    modal.querySelector('#closeModal').onclick = () => modal.style.display = 'none';
    modal.querySelector('#btnCloseSuccess').onclick = () => modal.style.display = 'none';

    function loadTutorRoleState() {
        currentTutorRole = GM_getValue('tutor_role', 'Cô');
        modal.querySelectorAll('.ui-role-chip').forEach(b => {
            if (b.getAttribute('data-role') === currentTutorRole) b.classList.add('active');
            else b.classList.remove('active');
        });
    }

    modal.querySelectorAll('.ui-role-chip').forEach(b => {
        b.onclick = (e) => {
            modal.querySelectorAll('.ui-role-chip').forEach(chip => chip.classList.remove('active'));
            e.target.classList.add('active');
            currentTutorRole = e.target.getAttribute('data-role');
            GM_setValue('tutor_role', currentTutorRole);
        };
    });

    const cardOptions = modal.querySelectorAll('.ui-card-option');
    cardOptions.forEach(card => {
        card.onclick = () => {
            cardOptions.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            currentMode = card.getAttribute('data-mode');
            modal.querySelector('#studentListContainer').style.display = (currentMode === 'custom') ? 'block' : 'none';
        };
    });

    const apiKeyInput = modal.querySelector('#geminiApiKey');
    const apiKeyDrawer = modal.querySelector('#apiKeyDrawer');
    const apiStatusBadge = modal.querySelector('#apiStatusBadge');
    const apiErrorMsg = modal.querySelector('#apiErrorMsg');

    function checkApiKeyDisplayState() {
        const savedKey = GM_getValue('gemini_api_key', '') || EMBEDDED_API_KEY;
        apiKeyInput.value = GM_getValue('gemini_api_key', '');

        if (savedKey) {
            apiKeyDrawer.style.display = 'none';
            apiStatusBadge.innerText = 'Sẵn sàng';
            apiErrorMsg.style.display = 'none';
        } else {
            apiKeyDrawer.style.display = 'block';
            apiStatusBadge.innerText = 'Chưa cài đặt';
        }
    }

    modal.querySelector('#btnToggleApiKey').onclick = () => {
        apiKeyDrawer.style.display = (apiKeyDrawer.style.display === 'none') ? 'block' : 'none';
    };

    modal.querySelector('#btnSaveKeyOnly').onclick = () => {
        const key = apiKeyInput.value.trim();
        if (key) {
            GM_setValue('gemini_api_key', key);
            apiStatusBadge.innerText = 'Đã lưu thành công';
            apiErrorMsg.style.display = 'none';
            setTimeout(() => { apiKeyDrawer.style.display = 'none'; }, 800);
        }
    };

    function scanPageData() {
        const topicMatch = document.body.innerText.match(/Chủ đề:\s*([^\n\r]+)/i);
        if (topicMatch && topicMatch[1]) {
            detectedTopic = topicMatch[1].trim();
        }
        modal.querySelector('#detectedTopic').innerText = `Chủ đề: ${detectedTopic}`;

        const detectedCups = scanStudentCups();
        detectedStudents = [];
        const studentRowsDiv = modal.querySelector('#studentRows');
        studentRowsDiv.innerHTML = '';

        const all = Array.from(document.querySelectorAll('*'));
        const idElements = all.filter(el => el.children.length === 0 && el.innerText && el.innerText.includes('ID học sinh:'));

        idElements.forEach((idEl, index) => {
            const parent = idEl.parentElement;
            let rawName = 'Học sinh ' + (index + 1);
            if (parent) {
                const lines = parent.innerText.split('\n').map(s => s.trim()).filter(Boolean);
                if (lines.length > 0 && !lines[0].includes('ID học sinh')) {
                    rawName = lines[0];
                }
            }

            let cleanName = rawName.replace(/^Lớp\s*\d+\s*[-–:]\s*/i, '').replace(/\s*[-–:]?\s*Lớp\s*\d+$/i, '').trim();
            const parts = cleanName.split(' ');
            let shortName = parts.length > 1 ? parts.slice(-2).join(' ') : cleanName;
            let cupCount = detectedCups[index] || 0;

            detectedStudents.push({
                index,
                fullName: cleanName,
                shortName: shortName,
                score: 10,
                cups: cupCount,
                note: ''
            });

            const row = document.createElement('div');
            row.className = 'student-item';
            row.setAttribute('data-student-idx', index);
            row.style = 'padding: 8px 0; border-bottom: 1px solid #f3f4f6;';
            row.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; flex-direction: column; max-width: 200px;">
                        <span style="font-size: 13.5px; font-weight: 500; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${cleanName}</span>
                        ${cupCount > 0 ? `<span style="font-size: 11px; color: #d97706; font-weight: 500; margin-top: 1px;">${cupCount} cúp</span>` : ''}
                    </div>
                    <div style="display: flex; gap: 5px;">
                        <button type="button" class="ui-score-chip active" data-val="10">10</button>
                        <button type="button" class="ui-score-chip" data-val="9">9</button>
                        <button type="button" class="ui-score-chip" data-val="8">8</button>
                        <button type="button" class="ui-score-chip" data-val="7">7</button>
                    </div>
                </div>
                <div class="student-note-wrap" style="display: none; margin-top: 8px;">
                    <input type="text" class="student-note-input" placeholder="Lý do trừ điểm (ví dụ: chưa hiểu bài, phản xạ chậm...)" style="width: 100%; box-sizing: border-box; padding: 6px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; outline: none; background: #ffffff; color: #111827;">
                </div>
            `;
            studentRowsDiv.appendChild(row);
        });

        studentRowsDiv.querySelectorAll('.student-item').forEach(item => {
            const sIdx = parseInt(item.getAttribute('data-student-idx'));
            const noteWrap = item.querySelector('.student-note-wrap');

            item.querySelectorAll('.ui-score-chip').forEach(b => {
                b.onclick = (e) => {
                    item.querySelectorAll('.ui-score-chip').forEach(chip => chip.classList.remove('active'));
                    e.target.classList.add('active');

                    const score = parseInt(e.target.getAttribute('data-val'));
                    detectedStudents[sIdx].score = score;

                    if (score < 10) {
                        noteWrap.style.display = 'block';
                        const noteInput = noteWrap.querySelector('input');
                        if (noteInput && !noteInput.value) noteInput.focus();
                    } else {
                        noteWrap.style.display = 'none';
                    }
                };
            });
        });
    }

    function scanStudentCups() {
        const all = Array.from(document.querySelectorAll('*'));
        const cupLabel = all.find(el => el.children.length === 0 && el.innerText && /Sao\/Cup\s*đạt\s*được/i.test(el.innerText.trim()));
        if (!cupLabel) return [];

        let cur = cupLabel.parentElement;
        for (let i = 0; i < 5 && cur; i++) {
            const matches = cur.innerText.match(/Số\s*cup:\s*(\d+)/gi);
            if (matches && matches.length > 0) {
                return matches.map(s => {
                    const m = s.match(/(\d+)/);
                    return m ? parseInt(m[1]) : 0;
                });
            }
            cur = cur.parentElement;
        }
        return [];
    }

    function setNativeValue(el, val) {
        if (!el) return;
        const valSetter = Object.getOwnPropertyDescriptor(el, 'value') ? Object.getOwnPropertyDescriptor(el, 'value').set : null;
        const prototype = Object.getPrototypeOf(el);
        const protoSetter = Object.getOwnPropertyDescriptor(prototype, 'value') ? Object.getOwnPropertyDescriptor(prototype, 'value').set : null;

        if (protoSetter && valSetter !== protoSetter) {
            protoSetter.call(el, val);
        } else if (valSetter) {
            valSetter.call(el, val);
        } else {
            el.value = val;
        }
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function findElementsInRow(rowRegex, tag = 'input') {
        const all = Array.from(document.querySelectorAll('*'));
        const matchedLabel = all.find(el => el.children.length === 0 && el.innerText && rowRegex.test(el.innerText.trim()));
        if (!matchedLabel) return [];

        let cur = matchedLabel.parentElement;
        for (let i = 0; i < 5 && cur; i++) {
            const found = cur.querySelectorAll(tag);
            if (found.length > 0) return Array.from(found);
            cur = cur.parentElement;
        }
        return [];
    }

    // XỬ LÝ NỘP: BẮT BUỘC PHẢI CÓ API KEY
    modal.querySelector('#btnSubmit').onclick = async () => {
        const effectiveKey = apiKeyInput.value.trim() || GM_getValue('gemini_api_key', '') || EMBEDDED_API_KEY;

        // ⚠️ KIỂM TRA BẮT BUỘC CÓ KEY
        if (!effectiveKey) {
            apiKeyDrawer.style.display = 'block';
            apiErrorMsg.style.display = 'block';
            apiErrorMsg.innerText = '⚠️ Bạn bắt buộc phải dán Gemini API Key để kích hoạt công cụ!';
            apiKeyInput.focus();
            return;
        }

        const submitBtn = modal.querySelector('#btnSubmit');
        submitBtn.innerText = 'Đang xử lý dữ liệu...';
        submitBtn.style.opacity = '0.7';

        const isAll10 = (currentMode === 'all_10');
        const studentRowsDiv = modal.querySelector('#studentRows');

        const finalStudents = detectedStudents.map(s => {
            const itemEl = studentRowsDiv.querySelector(`.student-item[data-student-idx="${s.index}"]`);
            const noteInput = itemEl ? itemEl.querySelector('.student-note-input') : null;
            const noteText = (noteInput && !isAll10) ? noteInput.value.trim() : '';

            return {
                ...s,
                score: isAll10 ? 10 : s.score,
                note: noteText
            };
        });

        // 1. Điền điểm số
        const rowCriteria = [
            /1\.\s*Từ\s*vựng/i,
            /2\.\s*Ngữ\s*pháp/i,
            /3\.\s*Nghe\s*hiểu/i,
            /4\.\s*Phản\s*xạ/i
        ];

        rowCriteria.forEach(regex => {
            const inputs = findElementsInRow(regex, 'input');
            inputs.forEach((inp, idx) => {
                if (finalStudents[idx]) setNativeValue(inp, finalStudents[idx].score.toString());
            });
        });

        // 2. Tạo nhận xét bằng AI
        let feedbackData = null;
        try {
            feedbackData = await generateAiFeedback(effectiveKey, detectedTopic, finalStudents, currentTutorRole);
        } catch (err) {
            console.warn('Lỗi gọi API, dùng bộ dự phòng:', err);
            feedbackData = generateSmartVariedFeedback(detectedTopic, finalStudents, currentTutorRole);
        }

        // 3. Điền nhận xét
        const allTextareas = Array.from(document.querySelectorAll('textarea'));
        const generalLabel = Array.from(document.querySelectorAll('*')).find(el => 
            el.children.length === 0 && el.innerText && el.innerText.includes('Nhận xét chung buổi học')
        );
        if (generalLabel) {
            const parentBlock = generalLabel.closest('div');
            const generalTa = parentBlock ? parentBlock.querySelector('textarea') : allTextareas[0];
            if (generalTa) setNativeValue(generalTa, feedbackData.general);
        }

        const knowledgeTas = findElementsInRow(/5\.\s*Tiếp\s*thu\s*kiến\s*thức/i, 'textarea');
        knowledgeTas.forEach((ta, idx) => {
            if (feedbackData.students[idx]) setNativeValue(ta, feedbackData.students[idx].knowledge);
        });

        const attitudeTas = findElementsInRow(/6\.\s*Thái\s*độ\s*học\s*tập/i, 'textarea');
        attitudeTas.forEach((ta, idx) => {
            if (feedbackData.students[idx]) setNativeValue(ta, feedbackData.students[idx].attitude);
        });

        // 4. Chuyển sang màn hình HOÀN TẤT
        submitBtn.innerText = 'Tự động điền đánh giá';
        submitBtn.style.opacity = '1';

        modal.querySelector('#summaryTopic').innerText = detectedTopic;
        modal.querySelector('#summaryStudents').innerText = `${finalStudents.length} học sinh`;

        modal.querySelector('#viewForm').style.display = 'none';
        modal.querySelector('#viewSuccess').style.display = 'block';
    };

    function generateSmartVariedFeedback(topic, students, role) {
        const generalTemplates = [
            `Buổi học hôm nay diễn ra rất hiệu quả và nhiều năng lượng tích cực với chủ đề "${topic}". Toàn lớp có thái độ học tập rất nghiêm túc, các con đều tập trung lắng nghe giảng và hào hứng tham gia các hoạt động tương tác, phản xạ phát âm to rõ ràng. ${role} rất khen ngợi tinh thần tự giác và sự tiến bộ rõ rệt của cả lớp hôm nay. Dặn dò: Các con nhớ tiếp tục phát huy, dành 10-15 phút ôn lại các từ vựng, mẫu câu trọng tâm và hoàn thành đầy đủ bài tập về nhà nhé!`,
            `Các con vừa hoàn thành một buổi học sôi nổi và chất lượng về chủ đề "${topic}". Không khí lớp học rất tích cực, các con chủ động tương tác, chăm chỉ phát biểu và phản xạ các câu hỏi rất nhanh nhẹn. ${role} rất biểu dương tinh thần học tập hăng hái của các con trong ca học này. Dặn dò: Để kiến thức được ghi nhớ sâu hơn, các con về nhà nhớ mở lại bài xem lại từ mới và hoàn thành bài tập về nhà được giao nhé. Chúc các con giữ vững phong độ!`,
            `Hôm nay lớp học diễn ra vui vẻ và đạt kết quả tốt với nội dung "${topic}". Thái độ học tập của các con rất đáng khen, con nào cũng giữ được sự tập trung, lễ phép và hào hứng thi đua học tập. ${role} rất vui vì thấy các con tự tin giao tiếp hơn mỗi ngày. Dặn dò: Về nhà các con nhớ luyện phát âm lại các từ đã học, làm bài tập về nhà đầy đủ để chuẩn bị thật tốt cho buổi học tiếp theo nhé!`
        ];
        const general = generalTemplates[Math.floor(Math.random() * generalTemplates.length)];

        const know10Bank = [
            (name) => `${name} tiếp thu bài rất nhanh, ghi nhớ từ vựng tốt và phát âm chuẩn các từ mới.`,
            (name) => `${name} có phản xạ ngôn ngữ tốt, nắm chắc các mẫu câu và vận dụng rất linh hoạt.`,
            (name) => `${name} hiểu bài ngay trên lớp, nhớ từ vựng tốt và trả lời câu hỏi rất tự tin.`,
            (name) => `${name} nắm vững kiến thức trọng tâm buổi học, phản xạ nhanh nhẹn và chính xác.`,
            (name) => `${name} tiếp thu bài xuất sắc, ghi nhớ từ và mẫu câu rất sâu, phát âm to rõ.`,
            (name) => `${name} có vốn từ tốt, lắng nghe hiệu quả và trả lời đúng hầu hết các câu hỏi.`,
            (name) => `${name} nhớ bài nhanh, tự tin tương tác và làm chủ bài học rất tốt.`
        ];

        const att10Bank = [
            (name) => `${name} rất ngoan, tập trung chú ý và hăng hái giơ tay phát biểu.`,
            (name) => `Thái độ học tập rất nghiêm túc, tích cực tương tác cùng ${role.toLowerCase()} suốt buổi.`,
            (name) => `${name} học tập hào hứng, chủ động tham gia nhiệt tình vào các hoạt động.`,
            (name) => `Con rất tập trung, có tinh thần học hỏi cao và phản hồi rất nhanh nhẹn.`,
            (name) => `Tác phong học tập rất tốt, chú ý lắng nghe giảng và có nhiều tiến bộ.`,
            (name) => `${name} chăm chỉ, tương tác sôi nổi và giữ được năng lượng tích cực suốt giờ học.`,
            (name) => `Con lễ phép, chú ý lắng nghe và rất tự giác trong các phần luyện tập.`
        ];

        const shuffledKnow = [...know10Bank].sort(() => 0.5 - Math.random());
        const shuffledAtt = [...att10Bank].sort(() => 0.5 - Math.random());

        const studentResults = students.map((s, idx) => {
            const name = s.shortName;
            let knowledgeText = '';
            let attitudeText = '';

            if (s.score === 10) {
                knowledgeText = shuffledKnow[idx % shuffledKnow.length](name);
                attitudeText = shuffledAtt[idx % shuffledAtt.length](name);
            } else {
                const reasonText = s.note ? `hôm nay con ${s.note.toLowerCase()}, ` : '';
                knowledgeText = `${name} cơ bản có cố gắng trong giờ học, tuy nhiên ${reasonText}con cần dành thêm thời gian ôn lại từ vựng và mẫu câu tại nhà để nắm chắc hơn nhé.`;
                attitudeText = `${name} có tinh thần học tập, cần chú ý tập trung và chủ động tương tác với ${role.toLowerCase()} nhiều hơn nữa trong các buổi tới.`;
            }

            return { knowledge: knowledgeText, attitude: attitudeText };
        });

        return { general, students: studentResults };
    }

    async function generateAiFeedback(apiKey, topic, students, role) {
        const studentList = students.map(s => {
            const noteStr = s.note ? ` [Lý do trừ điểm: "${s.note}"]` : '';
            return `- Tên: ${s.shortName} (${s.score}/10 điểm)${noteStr}`;
        }).join('\n');

        const prompt = `Bạn là trợ lý giáo viên tiếng Anh Edupia Tutor. 
Giáo viên là "${role}" (Hãy xưng hô với học sinh là "${role}", gọi học sinh là "con/các con", TUYỆT ĐỐI KHÔNG dùng từ ghép "Thầy/Cô").
Chủ đề bài học: "${topic}"
Danh sách học sinh:
${studentList}

Yêu cầu BẮT BUỘC:
1. Nhận xét chung: Đoạn văn 3-4 câu hoàn chỉnh (hoạt động bài học, thái độ lớp, lời khen chân thành của ${role}, nhắc làm BTVN).
2. Từng học sinh:
- KHÔNG trùng lặp câu chữ hay cấu trúc câu giữa các em.
- Gọi tên ngắn của học sinh.
- Mỗi em khen một góc độ hoàn toàn khác nhau (em khen phát âm chuẩn, em khen phản xạ nhanh, em khen hăng hái giơ tay, em khen tập trung chú ý, em khen ghi nhớ từ vựng tốt).
- TUYỆT ĐỐI KHÔNG dùng cùng một khuôn mẫu hay lặp lại một điệp khúc nào cho cả lớp.
- Nếu học sinh có [Lý do trừ điểm], hãy lồng ghép khéo léo và tế nhị vào câu knowledge, dùng lời văn sư phạm ấm áp của ${role} để động viên con.

Trả về JSON:
{
  "general": "Đoạn văn nhận xét chung...",
  "students": [
    { "name": "...", "knowledge": "...", "attitude": "..." }
  ]
}`;

        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "POST",
                url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
                headers: { "Content-Type": "application/json" },
                data: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { responseMimeType: "application/json" }
                }),
                onload: (res) => {
                    try {
                        const data = JSON.parse(res.responseText);
                        const text = data.candidates[0].content.parts[0].text;
                        resolve(JSON.parse(text));
                    } catch (e) {
                        reject(e);
                    }
                },
                onerror: reject
            });
        });
    }

})();
