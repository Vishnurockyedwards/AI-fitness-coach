// FitAI — MediaPipe Pose Detection Module
// Real-time rep counting + form feedback for exercise cards

const PoseDetection = (() => {
    // ── State ────────────────────────────────────────────────────────────────
    let pose        = null;
    let isRunning   = false;
    let currentExercise = null;
    let repCount    = 0;
    let repState    = 'up';
    let smoothedAngle = null;

    let videoEl, canvasEl, ctx;

    // ── MediaPipe landmark indices ───────────────────────────────────────────
    const LM = {
        NOSE: 0,
        LEFT_SHOULDER: 11,  RIGHT_SHOULDER: 12,
        LEFT_ELBOW:    13,  RIGHT_ELBOW:    14,
        LEFT_WRIST:    15,  RIGHT_WRIST:    16,
        LEFT_HIP:      23,  RIGHT_HIP:      24,
        LEFT_KNEE:     25,  RIGHT_KNEE:     26,
        LEFT_ANKLE:    27,  RIGHT_ANKLE:    28,
    };

    // ── Exercise → detection type mapping ───────────────────────────────────
    const TYPE = {
        'Squats':                            'squat',
        'Dead Lift':                         'deadlift',
        'Lunges':                            'lunge',
        'Leg Extensions':                    'leg_extension',
        'Push-Ups':                          'pushup',
        'Barbell Curl':                      'curl',
        'Hammer Curl':                       'curl',
        'Preacher Curl':                     'curl',
        'Lateral Raise':                     'lateral_raise',
        'Front Raise':                       'front_raise',
        'Overhead Press':                    'overhead_press',
        'Overhead Extension':                'overhead_press',
        'Triceps Pushdown':                  'triceps_pushdown',
        'Pull-Ups':                          'pullup',
        'Bent Over Row':                     'bent_row',
        'Mountain Pose (Tadasana)':          'yoga',
        'Downward Dog (Adho Mukha Svanasana)':'yoga',
        'Warrior II (Virabhadrasana II)':    'yoga',
        'Tree Pose (Vrikshasana)':           'yoga',
        "Child's Pose (Balasana)":           'yoga',
    };

    // ── Math helpers ─────────────────────────────────────────────────────────
    function calcAngle(a, b, c) {
        const rad = Math.atan2(c.y - b.y, c.x - b.x)
                  - Math.atan2(a.y - b.y, a.x - b.x);
        let deg = Math.abs(rad * 180 / Math.PI);
        if (deg > 180) deg = 360 - deg;
        return deg;
    }

    function vis(lm) { return lm && lm.visibility > 0.5; }

    function smooth(v) {
        smoothedAngle = smoothedAngle === null ? v : smoothedAngle * 0.7 + v * 0.3;
        return smoothedAngle;
    }

    // ── Rep counter state machine ────────────────────────────────────────────
    // dir: 'down_up' = starts high, goes low, comes back (squats/push-ups)
    //      'up_down' = starts low, goes high, comes back  (curls/raises)
    function countRep(angle, downThreshold, upThreshold, dir = 'down_up') {
        if (dir === 'down_up') {
            if (repState === 'up'   && angle < downThreshold) repState = 'down';
            else if (repState === 'down' && angle > upThreshold)  { repState = 'up'; bump(); }
        } else {
            if (repState === 'down' && angle < downThreshold) repState = 'up';
            else if (repState === 'up'   && angle > upThreshold)  { repState = 'down'; bump(); }
        }
    }

    function bump() {
        repCount++;
        const el = document.getElementById('repCount');
        if (!el) return;
        el.textContent = repCount;
        el.classList.add('rep-flash');
        setTimeout(() => el.classList.remove('rep-flash'), 400);
    }

    // ── Form feedback ────────────────────────────────────────────────────────
    function feedback(status, msg) {
        const badge    = document.getElementById('formBadge');
        const badgeTxt = document.getElementById('formText');
        const infoBar  = document.getElementById('feedbackText');
        if (!badge) return;
        badge.className = `form-badge ${status}`;
        badgeTxt.textContent = status === 'good' ? 'Good Form'
                             : status === 'warn' ? 'Fix Form'
                             : 'Detecting…';
        if (infoBar) infoBar.textContent = msg;
    }

    // ── Best side helper ─────────────────────────────────────────────────────
    function bestArm(lm) {
        const r = [lm[LM.RIGHT_SHOULDER], lm[LM.RIGHT_ELBOW], lm[LM.RIGHT_WRIST]];
        const l = [lm[LM.LEFT_SHOULDER],  lm[LM.LEFT_ELBOW],  lm[LM.LEFT_WRIST]];
        if (r.every(vis)) return r;
        if (l.every(vis)) return l;
        return null;
    }

    function bestLeg(lm) {
        const l = [lm[LM.LEFT_HIP],  lm[LM.LEFT_KNEE],  lm[LM.LEFT_ANKLE]];
        const r = [lm[LM.RIGHT_HIP], lm[LM.RIGHT_KNEE], lm[LM.RIGHT_ANKLE]];
        if (l.every(vis)) return l;
        if (r.every(vis)) return r;
        return null;
    }

    // ── Exercise analyzers ───────────────────────────────────────────────────
    function analyzeSquat(lm) {
        const leg = bestLeg(lm);
        if (!leg) return feedback('detecting', 'Stand sideways — ensure full body is visible');
        const [hip, knee, ankle] = leg;
        const angle = smooth(calcAngle(hip, knee, ankle));
        countRep(angle, 100, 155);

        const kneeFwd = (knee.x - ankle.x) * 100;
        if (kneeFwd > 15)
            feedback('warn', 'Knees tracking too far forward — push hips back');
        else if (vis(lm[LM.LEFT_SHOULDER]) && Math.abs(lm[LM.LEFT_SHOULDER].x - hip.x) * 100 > 20)
            feedback('warn', 'Keep chest up — torso leaning too far forward');
        else
            feedback('good', angle < 115 ? 'Great depth!' : `Lower for full depth — ${Math.round(angle)}°`);
    }

    function analyzePushup(lm) {
        const arm = bestArm(lm);
        if (!arm) return feedback('detecting', 'Position sideways — keep arms visible');
        const [shoulder, elbow, wrist] = arm;
        const angle = smooth(calcAngle(shoulder, elbow, wrist));
        countRep(angle, 95, 155);

        const hip = vis(lm[LM.LEFT_HIP]) ? lm[LM.LEFT_HIP] : lm[LM.RIGHT_HIP];
        const ank = vis(lm[LM.LEFT_ANKLE]) ? lm[LM.LEFT_ANKLE] : lm[LM.RIGHT_ANKLE];
        if (vis(hip) && vis(ank)) {
            const mid = (shoulder.y + ank.y) / 2;
            const dev = (hip.y - mid) * 100;
            if (dev >  8) feedback('warn', 'Hips sagging — engage your core');
            else if (dev < -8) feedback('warn', 'Hips too high — lower your body');
            else feedback('good', `Elbow angle: ${Math.round(angle)}°`);
        } else {
            feedback('good', `Elbow angle: ${Math.round(angle)}°`);
        }
    }

    function analyzeCurl(lm) {
        const arm = bestArm(lm);
        if (!arm) return feedback('detecting', 'Face camera — keep arms visible');
        const [shoulder, elbow, wrist] = arm;
        const angle = smooth(calcAngle(shoulder, elbow, wrist));
        // Down = arm extended (~160°), Up = fully curled (~40°)
        countRep(angle, 60, 150, 'down_up');

        const hip = vis(lm[LM.LEFT_HIP]) ? lm[LM.LEFT_HIP] : lm[LM.RIGHT_HIP];
        if (vis(hip) && Math.abs(shoulder.x - hip.x) * 100 > 12)
            feedback('warn', 'Keep elbows pinned — avoid swinging');
        else
            feedback('good', `Elbow angle: ${Math.round(angle)}°`);
    }

    function analyzeLateralRaise(lm) {
        const sh = vis(lm[LM.LEFT_SHOULDER]) ? lm[LM.LEFT_SHOULDER] : lm[LM.RIGHT_SHOULDER];
        const el = vis(lm[LM.LEFT_ELBOW])    ? lm[LM.LEFT_ELBOW]    : lm[LM.RIGHT_ELBOW];
        const wr = vis(lm[LM.LEFT_WRIST])    ? lm[LM.LEFT_WRIST]    : lm[LM.RIGHT_WRIST];
        if (!vis(sh) || !vis(wr)) return feedback('detecting', 'Face camera — stand with arms at sides');

        // Wrist y relative to shoulder y (lower y = higher on screen)
        const wristAbove = sh.y - wr.y; // positive = wrist above shoulder
        if (repState === 'up'   && wristAbove < -0.05) repState = 'down';
        else if (repState === 'down' && wristAbove > 0.08)  { repState = 'up'; bump(); }

        if (vis(el)) {
            const elbowAngle = calcAngle(sh, el, wr);
            if (elbowAngle < 140)
                feedback('warn', 'Keep a slight bend in elbow — avoid fully locking');
            else
                feedback('good', wristAbove > 0 ? 'Good height!' : 'Raise arms to shoulder height');
        } else {
            feedback('good', wristAbove > 0 ? 'Good height!' : 'Raise arms to shoulder height');
        }
    }

    function analyzeFrontRaise(lm) {
        const sh = vis(lm[LM.LEFT_SHOULDER]) ? lm[LM.LEFT_SHOULDER] : lm[LM.RIGHT_SHOULDER];
        const wr = vis(lm[LM.LEFT_WRIST])    ? lm[LM.LEFT_WRIST]    : lm[LM.RIGHT_WRIST];
        if (!vis(sh) || !vis(wr)) return feedback('detecting', 'Stand sideways to camera');

        const wristAbove = sh.y - wr.y;
        if (repState === 'up'   && wristAbove < -0.08) repState = 'down';
        else if (repState === 'down' && wristAbove > 0.05)  { repState = 'up'; bump(); }

        const hip = vis(lm[LM.LEFT_HIP]) ? lm[LM.LEFT_HIP] : lm[LM.RIGHT_HIP];
        if (vis(hip) && Math.abs(sh.x - hip.x) * 100 > 15)
            feedback('warn', 'Avoid leaning back — keep torso upright');
        else
            feedback('good', wristAbove > 0 ? 'Good height!' : 'Raise arms to shoulder height');
    }

    function analyzeOverheadPress(lm) {
        const arm = bestArm(lm);
        if (!arm) return feedback('detecting', 'Face camera — raise arms to show full movement');
        const [shoulder, elbow, wrist] = arm;
        const angle = smooth(calcAngle(shoulder, elbow, wrist));
        countRep(angle, 100, 155);
        feedback('good', `Elbow angle: ${Math.round(angle)}°`);
    }

    function analyzeLunge(lm) {
        const leg = bestLeg(lm);
        if (!leg) return feedback('detecting', 'Stand sideways — ensure full body is visible');
        const [hip, knee, ankle] = leg;
        const angle = smooth(calcAngle(hip, knee, ankle));
        countRep(angle, 100, 155);
        feedback('good', angle < 115 ? 'Good lunge depth!' : `Knee angle: ${Math.round(angle)}°`);
    }

    function analyzeDeadlift(lm) {
        const sh = vis(lm[LM.LEFT_SHOULDER]) ? lm[LM.LEFT_SHOULDER] : lm[LM.RIGHT_SHOULDER];
        const hp = vis(lm[LM.LEFT_HIP])      ? lm[LM.LEFT_HIP]      : lm[LM.RIGHT_HIP];
        const kn = vis(lm[LM.LEFT_KNEE])     ? lm[LM.LEFT_KNEE]     : lm[LM.RIGHT_KNEE];
        if (!vis(sh) || !vis(hp) || !vis(kn)) return feedback('detecting', 'Stand sideways — ensure full body is visible');

        const angle = smooth(calcAngle(sh, hp, kn));
        countRep(angle, 90, 155);

        if (Math.abs(sh.x - hp.x) > 0.15)
            feedback('warn', 'Keep your back flat — avoid rounding');
        else
            feedback('good', `Hip angle: ${Math.round(angle)}°`);
    }

    function analyzePullup(lm) {
        const arm = bestArm(lm);
        if (!arm) return feedback('detecting', 'Ensure upper body is fully visible');
        const [shoulder, elbow, wrist] = arm;
        const angle = smooth(calcAngle(shoulder, elbow, wrist));
        countRep(angle, 100, 155);
        feedback('good', `Elbow angle: ${Math.round(angle)}°`);
    }

    function analyzeTricepsPushdown(lm) {
        const arm = bestArm(lm);
        if (!arm) return feedback('detecting', 'Face camera — keep arms visible');
        const [shoulder, elbow, wrist] = arm;
        const angle = smooth(calcAngle(shoulder, elbow, wrist));
        countRep(angle, 100, 155);
        feedback('good', `Elbow angle: ${Math.round(angle)}°`);
    }

    function analyzeBentRow(lm) {
        const arm = bestArm(lm);
        if (!arm) return feedback('detecting', 'Position sideways to camera');
        const [shoulder, elbow, wrist] = arm;
        const angle = smooth(calcAngle(shoulder, elbow, wrist));
        countRep(angle, 100, 155);
        feedback('good', `Elbow angle: ${Math.round(angle)}°`);
    }

    function analyzeLegExtension(lm) {
        const leg = bestLeg(lm);
        if (!leg) return feedback('detecting', 'Sit sideways — ensure legs are visible');
        const [hip, knee, ankle] = leg;
        const angle = smooth(calcAngle(hip, knee, ankle));
        // Extension: leg goes from ~90° (bent) to ~170° (straight)
        if (repState === 'down' && angle > 155) { repState = 'up'; bump(); }
        else if (repState === 'up' && angle < 105) repState = 'down';
        feedback('good', `Knee angle: ${Math.round(angle)}°`);
    }

    function analyzeYoga(lm) {
        const anyVis = Object.values(LM).some(i => vis(lm[i]));
        feedback('good', anyVis ? 'Hold the pose — breathe deeply' : 'Position yourself in front of camera');
    }

    function analyzeGeneric(lm) {
        const anyVis = Object.values(LM).some(i => vis(lm[i]));
        feedback(anyVis ? 'good' : 'detecting',
                 anyVis ? 'Pose detected — perform your exercise'
                        : 'Position yourself in front of camera');
    }

    // ── MediaPipe results callback ───────────────────────────────────────────
    function onResults(results) {
        if (!ctx || !canvasEl) return;
        ctx.save();
        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

        // Mirror the canvas so the view feels like a mirror (front camera)
        ctx.translate(canvasEl.width, 0);
        ctx.scale(-1, 1);

        // Draw the video frame (already in mirrored space)
        ctx.drawImage(results.image, 0, 0, canvasEl.width, canvasEl.height);

        if (results.poseLandmarks) {
            const lm = results.poseLandmarks;

            // Draw skeleton inside the same mirrored transform so it aligns with the video
            if (window.drawConnectors && window.POSE_CONNECTIONS) {
                drawConnectors(ctx, lm, POSE_CONNECTIONS, {
                    color: '#00f5d4',
                    lineWidth: 3,
                    visibilityMin: 0.5
                });
            }
            if (window.drawLandmarks) {
                drawLandmarks(ctx, lm, {
                    color: '#ff5722',
                    fillColor: '#ffffff',
                    lineWidth: 2,
                    radius: 5,
                    visibilityMin: 0.5
                });
            }

            const type = TYPE[currentExercise] || 'generic';
            switch (type) {
                case 'squat':            analyzeSquat(lm);          break;
                case 'pushup':           analyzePushup(lm);         break;
                case 'curl':             analyzeCurl(lm);           break;
                case 'lateral_raise':    analyzeLateralRaise(lm);   break;
                case 'front_raise':      analyzeFrontRaise(lm);     break;
                case 'overhead_press':   analyzeOverheadPress(lm);  break;
                case 'lunge':            analyzeLunge(lm);          break;
                case 'deadlift':         analyzeDeadlift(lm);       break;
                case 'pullup':           analyzePullup(lm);         break;
                case 'triceps_pushdown': analyzeTricepsPushdown(lm);break;
                case 'bent_row':         analyzeBentRow(lm);        break;
                case 'leg_extension':    analyzeLegExtension(lm);   break;
                case 'yoga':             analyzeYoga(lm);           break;
                default:                 analyzeGeneric(lm);        break;
            }
        } else {
            feedback('detecting', 'No pose detected — step into frame');
        }

        ctx.restore();
    }

    // ── Pose init ────────────────────────────────────────────────────────────
    function initPose() {
        if (pose) return;
        pose = new Pose({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        });
        pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: false,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });
        pose.onResults(onResults);
    }

    // ── Frame loop ───────────────────────────────────────────────────────────
    async function processFrame() {
        if (!isRunning || !pose || !videoEl) return;
        if (videoEl.readyState >= 2) {
            await pose.send({ image: videoEl });
        }
        requestAnimationFrame(processFrame);
    }

    // ── Camera control ───────────────────────────────────────────────────────
    async function startCamera() {
        if (isRunning) return;
        videoEl  = document.getElementById('poseVideo');
        canvasEl = document.getElementById('poseCanvas');
        ctx      = canvasEl.getContext('2d');

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: 'user' }
            });
            videoEl.srcObject = stream;
            await videoEl.play();

            // Wait for metadata so we get real dimensions
            await new Promise(res => {
                if (videoEl.readyState >= 1) { res(); return; }
                videoEl.onloadedmetadata = res;
            });
            canvasEl.width  = videoEl.videoWidth  || 640;
            canvasEl.height = videoEl.videoHeight || 480;

            initPose();
            isRunning = true;
            processFrame();

            const wrapper = document.querySelector('.pose-video-wrapper');
            if (wrapper) wrapper.classList.add('camera-active');

            const btn = document.getElementById('startPoseBtn');
            if (btn) {
                btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> Stop Camera`;
                btn.classList.add('active');
            }
        } catch (err) {
            feedback('detecting', 'Camera access denied — please allow camera permissions in your browser');
            console.error('PoseDetection camera error:', err);
        }
    }

    function stopCamera() {
        if (!isRunning) return;
        isRunning = false;
        if (videoEl?.srcObject) {
            videoEl.srcObject.getTracks().forEach(t => t.stop());
            videoEl.srcObject = null;
        }
        if (ctx && canvasEl) ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

        const wrapper = document.querySelector('.pose-video-wrapper');
        if (wrapper) wrapper.classList.remove('camera-active');

        const btn = document.getElementById('startPoseBtn');
        if (btn) {
            btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> Start Camera`;
            btn.classList.remove('active');
        }
        feedback('detecting', 'Camera stopped — click Start Camera to resume');
    }

    // ── Modal control ────────────────────────────────────────────────────────
    function openModal(exerciseName) {
        currentExercise = exerciseName;
        repCount        = 0;
        repState        = 'up';
        smoothedAngle   = null;

        const repEl = document.getElementById('repCount');
        if (repEl) repEl.textContent = '0';
        const nameEl = document.getElementById('poseExerciseName');
        if (nameEl) nameEl.textContent = exerciseName;
        feedback('detecting', 'Click "Start Camera" to begin pose detection');

        const modal = document.getElementById('poseModal');
        if (!modal) return;
        modal.classList.remove('hidden');
        requestAnimationFrame(() => modal.classList.add('pose-modal-open'));
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        stopCamera();
        const modal = document.getElementById('poseModal');
        if (!modal) return;
        modal.classList.remove('pose-modal-open');
        setTimeout(() => modal.classList.add('hidden'), 300);
        document.body.style.overflow = '';
    }

    function resetReps() {
        repCount      = 0;
        repState      = 'up';
        smoothedAngle = null;
        const el = document.getElementById('repCount');
        if (el) {
            el.textContent = '0';
            el.classList.add('rep-flash');
            setTimeout(() => el.classList.remove('rep-flash'), 400);
        }
    }

    return { openModal, closeModal, startCamera, stopCamera, resetReps };
})();

// ── DOM wiring ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Inject "Detect Pose" button into every exercise card
    document.querySelectorAll('.exercise-card').forEach(card => {
        const name = card.querySelector('h4')?.textContent?.trim();
        if (!name) return;
        const btn = document.createElement('button');
        btn.className   = 'pose-detect-btn';
        btn.textContent = 'Detect Pose';
        btn.setAttribute('aria-label', `Start pose detection for ${name}`);
        btn.addEventListener('click', e => {
            e.stopPropagation();
            PoseDetection.openModal(name);
        });
        card.appendChild(btn);
    });

    // Modal controls
    document.getElementById('poseCloseBtn')
        ?.addEventListener('click', PoseDetection.closeModal);

    document.getElementById('poseModal')
        ?.addEventListener('click', e => {
            if (e.target.id === 'poseModal') PoseDetection.closeModal();
        });

    document.getElementById('startPoseBtn')
        ?.addEventListener('click', () => {
            const btn = document.getElementById('startPoseBtn');
            btn?.classList.contains('active')
                ? PoseDetection.stopCamera()
                : PoseDetection.startCamera();
        });

    document.getElementById('resetRepsBtn')
        ?.addEventListener('click', PoseDetection.resetReps);

    // ESC to close
    document.addEventListener('keydown', e => {
        if (e.key !== 'Escape') return;
        const modal = document.getElementById('poseModal');
        if (modal && !modal.classList.contains('hidden')) PoseDetection.closeModal();
    });
});
