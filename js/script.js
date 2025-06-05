import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

    const supabaseUrl = 'https://jkedvvvfbpqvokxtcycq.supabase.co'; // замените на свой
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprZWR2dnZmYnBxdm9reHRjeWNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMjYyNjIsImV4cCI6MjA2NDcwMjI2Mn0.LOvEz9NeJz2CmGpAe_VMw3GYQg2lnov-F_fKTsEc56g'; // замените на свой
    const supabase = createClient(supabaseUrl, supabaseKey);

    const userInfoDiv = document.getElementById('user-info');
    const logoutBtn = document.getElementById('logout-btn');

    const loginFormDiv = document.getElementById('login-form');
    const signupFormDiv = document.getElementById('signup-form');
    const showSignupLink = document.getElementById('show-signup');
    const showLoginLink = document.getElementById('show-login');

    const formLogin = document.getElementById('form-login');
    const formSignup = document.getElementById('form-signup');
    const uploadForm = document.getElementById('upload-form');

    const trackList = document.getElementById('track-list');

    // Показать форму регистрации
    showSignupLink.addEventListener('click', (e) => {
      e.preventDefault();
      loginFormDiv.classList.remove('active');
      signupFormDiv.classList.add('active');
      uploadForm.style.display = 'none';
    });

    // Показать форму входа
    showLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      signupFormDiv.classList.remove('active');
      loginFormDiv.classList.add('active');
      uploadForm.style.display = 'none';
    });

    // Проверить текущего пользователя
    async function checkUser() {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (session?.user) {
        userInfoDiv.textContent = `Logged in as: ${session.user.email}`;
        logoutBtn.style.display = 'block';
        loginFormDiv.classList.remove('active');
        signupFormDiv.classList.remove('active');
        uploadForm.style.display = 'block';
        await fetchTracks();
      } else {
        userInfoDiv.textContent = '';
        logoutBtn.style.display = 'none';
        uploadForm.style.display = 'none';
        loginFormDiv.classList.add('active');
        signupFormDiv.classList.remove('active');
        trackList.innerHTML = '';
      }
    }

    // Логин
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(formLogin);
      const email = formData.get('email');
      const password = formData.get('password');

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        alert('Ошибка входа: ' + error.message);
        return;
      }

      await checkUser();
    });

    // Регистрация
    formSignup.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(formSignup);
      const email = formData.get('email');
      const password = formData.get('password');
      const full_name = formData.get('full_name');

      // Регистрация в Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        alert('Ошибка регистрации: ' + signUpError.message);
        return;
      }

      // Создание профиля
      const userId = signUpData.user.id;
      const { error: profileError } = await supabase.from('profiles').insert([{ id: userId, full_name }]);
      if (profileError) {
        alert('Ошибка создания профиля: ' + profileError.message);
        return;
      }

      alert('Регистрация прошла успешно! Теперь войдите.');
      signupFormDiv.classList.remove('active');
      loginFormDiv.classList.add('active');
      formSignup.reset();
    });

    // Выход
    logoutBtn.addEventListener('click', async () => {
      await supabase.auth.signOut();
      await checkUser();
    });

    // Загрузка треков
    async function fetchTracks() {
      const { data, error } = await supabase.from('tracks').select('*, profiles(*)').order('created_at', { ascending: false });
      if (error) {
        trackList.innerHTML = `<p style="color:red">Ошибка загрузки треков: ${error.message}</p>`;
        return;
      }
      if (!data.length) {
        trackList.innerHTML = '<p>No tracks yet. Add your first track!</p>';
        return;
      }

      trackList.innerHTML = '';
      data.forEach(track => {
        const div = document.createElement('div');
        div.className = 'track';

        div.innerHTML = `
          ${track.cover ? `<img src="${track.cover}" alt="Cover">` : ''}
          <div class="track-info">
            <strong>${track.title}</strong> — ${track.artist} <br />
            <small>Added by: ${track.profiles?.full_name || 'Unknown'}</small>
            <audio controls src="${track.url}"></audio>
          </div>
        `;
        trackList.appendChild(div);
      });
    }

    // Добавление трека
    uploadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(uploadForm);
      const title = formData.get('title');
      const artist = formData.get('artist');
      const url = formData.get('url');
      const cover = formData.get('cover');

      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        alert('Требуется авторизация');
        return;
      }

      const { error } = await supabase.from('tracks').insert([{
        user_id: user.id,
        title,
        artist,
        url,
        cover
      }]);

      if (error) {
        alert('Ошибка добавления трека: ' + error.message);
        return;
      }

      alert('Трек добавлен!');
      uploadForm.reset();
      await fetchTracks();
    });

    // При загрузке страницы проверить пользователя
    checkUser();