/* ==========================================================================
   DEVOPS PORTFOLIO CUSTOM INTERACTIONS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileMenu();
  initTerminal();
  initContactForm();
  initConfetti();
});

/* --------------------------------------------------------------------------
   1. Theme Management (Light / Dark Mode)
   -------------------------------------------------------------------------- */
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const storedTheme = localStorage.getItem('theme');
  
  // Set default theme to Dark if not specified
  if (storedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'light') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  });
}

/* --------------------------------------------------------------------------
   2. Mobile Responsive Navigation
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  
  mobileToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    mobileToggle.classList.toggle('active');
    
    // Animate hamburger bars to 'X'
    const bars = mobileToggle.querySelectorAll('.bar');
    if (navMenu.classList.contains('active')) {
      bars[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
      bars[1].style.opacity = '0';
      bars[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
    } else {
      bars[0].style.transform = 'none';
      bars[1].style.opacity = '1';
      bars[2].style.transform = 'none';
    }
  });
  
  // Close menu when a link is clicked
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      mobileToggle.classList.remove('active');
      const bars = mobileToggle.querySelectorAll('.bar');
      bars[0].style.transform = 'none';
      bars[1].style.opacity = '1';
      bars[2].style.transform = 'none';
    });
  });
  
  // Active Link Tracking on Scroll
  window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section, header');
    const scrollPosition = window.scrollY + 120;
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   3. Interactive Virtual Bash Terminal
   -------------------------------------------------------------------------- */
function initTerminal() {
  const terminalInput = document.getElementById('terminal-input');
  const terminalOutput = document.getElementById('terminal-output');
  const terminalBody = document.getElementById('terminal-body');
  const terminalReset = document.getElementById('terminal-reset');
  const shortcuts = document.querySelectorAll('.t-shortcut');
  
  let commandHistory = [];
  let historyIndex = -1;

  // Pre-configured mock data for command replies
  const commandAnswers = {
    help: `Available DevOps commands:
  <span class="t-shortcut">help</span>          - Print this guidance panel.
  <span class="t-shortcut">neofetch</span>      - Show system specifications & stats.
  <span class="t-shortcut">cat info.txt</span>  - Read profile & philosophy.
  <span class="t-shortcut">skills</span>        - Output DevOps technical stack table.
  <span class="t-shortcut">docker ps</span>     - View live active Docker containers.
  <span class="t-shortcut">jenkins run</span>   - Trigger live CI/CD pipeline simulation.
  <span class="t-shortcut">clear</span>         - Clear the console screen.`,
    
    neofetch: `<span>      .---.       </span>  <span class="logo-accent">alex</span>@<span class="logo-accent">devops-srv</span>
<span>     /     \\      </span>  ------------------
<span>     \\_@_/      </span>  OS: Ubuntu 24.04 LTS (x86_64)
<span>     /     \\      </span>  Host: AWS EC2 t2.micro
<span>    |       |     </span>  Kernel: 6.8.0-1008-aws
<span>    /  \\_/  \\    </span>  Uptime: 24 days, 6 hours
<span>   /\\_______/\\    </span>  Shell: bash 5.2.21
<span>  /           \\   </span>  Docker Containers: 1 Running
<span> /             \\  </span>  Active CI/CD Service: Jenkins v2.440.1`,
    
    'cat info.txt': `<b>[Alex Mercer - DevOps Portfolio]</b>
--------------------------------------------
<b>Mission:</b> Erase human friction from delivery systems.
<b>Focus Areas:</b>
- Multi-environment automation.
- Microservice orchestration & security hardening.
- Container performance optimization.
<b>Favorite Tools:</b> Jenkins pipelines, Docker multi-stage builds, Nginx routing.`,

    skills: `+-----------------------------------------+
| <span class="logo-accent">DevOps Core Competency Grid</span>             |
+---------------------+-------------------+
| <b>Skill Domain</b>        | <b>Tech Tools</b>          |
+---------------------+-------------------+
| CI/CD Orchestration | Jenkins, Git, GHA |
| Containerization    | Docker, DockerHub |
| Cloud Services      | AWS (EC2, S3, SG) |
| Web Application     | Nginx, HTML5, CSS |
| Linux Engineering   | Bash, SSH, Systemd|
+---------------------+-------------------+`,

    'docker ps': `CONTAINER ID   IMAGE                          COMMAND                  CREATED        STATUS         PORTS                NAMES
b1e84a29cf0d   alexdevops/portfolio-app:1.0   "/docker-entrypoint.…"   2 hours ago    Up 2 hours     0.0.0.0:80-&gt;80/tcp   portfolio-web-server`,

    clear: ''
  };

  // Keyboard navigation & execution
  terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const command = terminalInput.value.trim().toLowerCase();
      if (command) {
        commandHistory.push(terminalInput.value.trim());
        historyIndex = commandHistory.length;
        executeCommand(command);
      }
      terminalInput.value = '';
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        terminalInput.value = commandHistory[historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        terminalInput.value = commandHistory[historyIndex];
      } else {
        historyIndex = commandHistory.length;
        terminalInput.value = '';
      }
    }
  });

  // Shortcut triggers
  shortcuts.forEach(btn => {
    btn.addEventListener('click', () => {
      const cmd = btn.getAttribute('data-cmd');
      terminalInput.value = cmd;
      executeCommand(cmd);
      terminalInput.value = '';
    });
  });

  // Reset Terminal Button
  terminalReset.addEventListener('click', () => {
    terminalOutput.innerHTML = `
      <div class="output-row">Last login: Tue May 26 19:27:35 on ec2-ubuntu-t2-micro</div>
      <div class="output-row">Type 'help' to see list of custom developer commands.</div>
    `;
    terminalBody.scrollTop = 0;
  });

  // Execute Command Logic
  function executeCommand(cmd) {
    // Append Prompt and Input line to terminal history first
    const cmdLine = document.createElement('div');
    cmdLine.className = 'output-row';
    cmdLine.innerHTML = `<span class="terminal-prompt">alex@devops-srv:~$</span> <span>${cmd}</span>`;
    terminalOutput.appendChild(cmdLine);

    if (cmd === 'clear') {
      terminalOutput.innerHTML = '';
      return;
    }

    if (cmd === 'jenkins run') {
      runLivePipelineSimulation();
      return;
    }

    const outputRow = document.createElement('div');
    outputRow.className = 'output-row';
    
    if (commandAnswers.hasOwnProperty(cmd)) {
      outputRow.innerHTML = commandAnswers[cmd];
    } else {
      outputRow.innerHTML = `<span class="accent-red">bash: command not found: ${cmd}</span>. Type '<span class="accent-cyan">help</span>' for a list of available actions.`;
    }
    
    terminalOutput.appendChild(outputRow);
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  // Cool Real-time Jenkins Pipeline Emulator
  function runLivePipelineSimulation() {
    const steps = [
      { msg: '★ [Pipeline] Start Jenkins Build job #14', delay: 400, color: 'text-secondary' },
      { msg: '[Stage 1] 🗂 Cloning source code repository from GitHub...', delay: 800, color: 'accent-cyan' },
      { msg: ' &gt;&gt; git clone https://github.com/alex-mercer-devops/portfolio-website.git .', delay: 300, color: 'text-muted' },
      { msg: ' &gt;&gt; Fetching main branch... Success (1.2s)', delay: 400, color: 'accent-green' },
      { msg: '[Stage 2] 📦 Installing developer packages & project dependencies...', delay: 1000, color: 'accent-cyan' },
      { msg: ' &gt;&gt; npm install --silent', delay: 400, color: 'text-muted' },
      { msg: ' &gt;&gt; Installed 82 packages. Safe check: 0 vulnerabilities (18.4s)', delay: 300, color: 'accent-green' },
      { msg: '[Stage 3] 🔨 Compiling application static bundle...', delay: 800, color: 'accent-cyan' },
      { msg: ' &gt;&gt; npm run build', delay: 300, color: 'text-muted' },
      { msg: ' &gt;&gt; vite v5.2.0 building in production mode...', delay: 200, color: 'text-muted' },
      { msg: ' &gt;&gt; dist/index.html                     4.12 kB │ gzip: 1.84 kB', delay: 200, color: 'text-muted' },
      { msg: ' &gt;&gt; dist/assets/index-Bf9Y0z.css       12.80 kB │ gzip: 3.42 kB', delay: 100, color: 'text-muted' },
      { msg: ' &gt;&gt; dist/assets/index-L8m2pX.js        8.45 kB │ gzip: 2.91 kB', delay: 100, color: 'text-muted' },
      { msg: ' &gt;&gt; Build successfully compiled (4.7s)', delay: 200, color: 'accent-green' },
      { msg: '[Stage 4] 🐳 Building optimized Docker container image...', delay: 1000, color: 'accent-cyan' },
      { msg: ' &gt;&gt; docker build -t alexdevops/portfolio-app:1.4 .', delay: 300, color: 'text-muted' },
      { msg: ' &gt;&gt; Sending build context to Docker daemon... 218 kB', delay: 200, color: 'text-muted' },
      { msg: ' &gt;&gt; Step 1/3: FROM nginx:alpine - Pull success', delay: 200, color: 'text-muted' },
      { msg: ' &gt;&gt; Step 2/3: COPY dist/ /usr/share/nginx/html/', delay: 100, color: 'text-muted' },
      { msg: ' &gt;&gt; Step 3/3: EXPOSE 80 - Tagging image...', delay: 100, color: 'text-muted' },
      { msg: ' &gt;&gt; Successfully tagged image: alexdevops/portfolio-app:1.4 (12.1s)', delay: 200, color: 'accent-green' },
      { msg: '[Stage 5] 🚀 Authenticating & pushing image to DockerHub...', delay: 900, color: 'accent-cyan' },
      { msg: ' &gt;&gt; docker login -u ****** -p ******', delay: 300, color: 'text-muted' },
      { msg: ' &gt;&gt; Login succeeded.', delay: 200, color: 'accent-green' },
      { msg: ' &gt;&gt; docker push alexdevops/portfolio-app:1.4', delay: 200, color: 'text-muted' },
      { msg: ' &gt;&gt; Pushed to registry: tag 1.4 active (8.9s)', delay: 400, color: 'accent-green' },
      { msg: '[Stage 6] 🧹 Pruning old deprecated container deployments...', delay: 600, color: 'accent-cyan' },
      { msg: ' &gt;&gt; docker stop portfolio-web-server || true', delay: 200, color: 'text-muted' },
      { msg: ' &gt;&gt; Stopped active container portfolio-web-server', delay: 100, color: 'text-muted' },
      { msg: ' &gt;&gt; docker rm portfolio-web-server || true', delay: 200, color: 'text-muted' },
      { msg: ' &gt;&gt; Cleaned container portfolio-web-server (2.1s)', delay: 100, color: 'accent-green' },
      { msg: '[Stage 7] 🌐 Deploying new Docker container live...', delay: 800, color: 'accent-cyan' },
      { msg: ' &gt;&gt; docker run -d --name portfolio-web-server -p 80:80 alexdevops/portfolio-app:1.4', delay: 300, color: 'text-muted' },
      { msg: ' &gt;&gt; Container b2a138c20d7f launched successfully (3.0s)', delay: 300, color: 'accent-green' },
      { msg: '[Stage 8] 🩺 Verifying application operational health...', delay: 700, color: 'accent-cyan' },
      { msg: ' &gt;&gt; curl -Is http://localhost:80 | head -n 1', delay: 400, color: 'text-muted' },
      { msg: ' &gt;&gt; Response status: HTTP/1.1 200 OK (1.5s)', delay: 100, color: 'accent-green' },
      { msg: '✔ SUCCESS: Pipeline complete. Total duration: 51.9s', delay: 200, color: 'accent-green' }
    ];

    // Disable input while running
    terminalInput.disabled = true;
    terminalInput.placeholder = 'Pipeline running... please wait.';

    let currentStep = 0;

    function runStep() {
      if (currentStep < steps.length) {
        const step = steps[currentStep];
        const stepRow = document.createElement('div');
        stepRow.className = `output-row ${step.color}`;
        stepRow.innerHTML = step.msg;
        terminalOutput.appendChild(stepRow);
        terminalBody.scrollTop = terminalBody.scrollHeight;
        
        currentStep++;
        setTimeout(runStep, step.delay);
      } else {
        // Re-enable input
        terminalInput.disabled = false;
        terminalInput.placeholder = 'Type a command...';
        terminalInput.focus();
      }
    }

    runStep();
  }
}

/* --------------------------------------------------------------------------
   4. Form Capture & AJAX Simulation
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const successMessage = document.getElementById('form-success');
  
  if (!form) return;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Simulate contact form network request
    const btn = form.querySelector('button[type="submit"]');
    const oldBtnText = btn.innerText;
    btn.disabled = true;
    btn.innerText = 'PINGING...';
    
    setTimeout(() => {
      form.style.opacity = '0';
      setTimeout(() => {
        form.style.display = 'none';
        successMessage.classList.add('active');
      }, 300);
    }, 1500);
  });
}

/* --------------------------------------------------------------------------
   5. Confetti Simulation for live test triggers
   -------------------------------------------------------------------------- */
function initConfetti() {
  const testBtn = document.getElementById('trigger-confetti');
  if (!testBtn) return;
  
  testBtn.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Quick notification banner to show web app is ready
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.bottom = '24px';
    notification.style.right = '24px';
    notification.style.backgroundColor = 'var(--accent-green)';
    notification.style.color = '#ffffff';
    notification.style.padding = '16px 24px';
    notification.style.borderRadius = 'var(--radius-sm)';
    notification.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
    notification.style.zIndex = '2000';
    notification.style.fontFamily = 'var(--font-sans)';
    notification.style.fontWeight = '600';
    notification.style.transition = 'all 0.3s ease';
    notification.style.transform = 'translateY(100px)';
    notification.style.opacity = '0';
    notification.innerHTML = '🩺 Health Check Passed! http://localhost:80 responded 200 OK!';
    
    document.body.appendChild(notification);
    
    // Slide in
    setTimeout(() => {
      notification.style.transform = 'translateY(0)';
      notification.style.opacity = '1';
    }, 100);
    
    // Slide out and remove
    setTimeout(() => {
      notification.style.transform = 'translateY(100px)';
      notification.style.opacity = '0';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 4000);
  });
}
