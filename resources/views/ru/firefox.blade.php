@extends('layouts.app')

@section('title', 'Проверка грамматики и стиля в Firefox')

@section('content')
    <div id="textContent" class="content-section" style="text-align: left">

        <div class="container">

            <h1>Проверка грамматики и стиля для Firefox</h1>

            <p>Mozilla Firefox содержит проверку правописания, но эта проверка не сможет найти
                ошибки в употреблении похожих слов ("Children resemble <u>there</u> parents") или обнаружить опечатку, которая
                приводит к грамматической ошибке ("I talk<u>s</u> to him yesterday"). LanguageTool –
                это система с открытым исходным кодом для проверки грамматики и стиля. Система поможет найти много ошибок в тексте,
                которые стандартная проверка правописания по словарю не сможет найти. Сейчас LanguageTool доступен и как расширение для браузера Firefox.
                Теперь текст можно проверить перед тем, как отправить его в Интернет.

            <p>Движок LanguageTool свободен, не требует регистрации и <a href="../../../privacy/">мы не собираем ваши тексты.</a>
                Он поддерживает английский, русский, испанский, французский, немецкий, польский <a href="../../../languages/">и другие языки</a>.</p>

            <div id="download" style="margin-top: 20px;">
                <div style="width:280px;" class="button_container">
                    <a href="https://addons.mozilla.org/ru-RU/firefox/addon/languagetool/" class="piwik_download">
                        <div class="inner_button" style="text-align: center">
                            <div class="title"><strong>Щёлкните здесь</strong> для установки</div>
                        </div>
                    </a>
                </div>
            </div>
            <div style="clear: both;"></div>

            <p>После установки расширения появится значок LT на панели поиска:

            <p><img src="/images/browser/firefox/lt-icon.png">

            <p>Для проверки текста щёлкните мышкой по значку расширения, когда курсор находится в текстовом поле, которое надо проверить.
                Всплывающее окно покажет возможные ошибки:

                <video style="margin-top:20px" src="/images/browser/firefox/screencast1.webm" autoplay loop controls>

            <p>Для большинства ошибок LanguageTool может показать одно или несколько предложений по исправлению
                ошибки. Щёлкните по ним для исправления ошибки в проверяемом тексте.
                Ещё можно проверить текст веб-страницы. Но к этому тексту нельзя применить варианты исправления,
                так как расширение не может изменять текст веб-страницы.


                <!--
                <h2>Advanced Options</h2>
                <p>run server locally
                -->


            <h2>Известные проблемы</h2>

            <ul>
                <li>Невозможно проверить текст на вкладках браузера, которые были открыты до установки этого расширения.</li>
                <li>Только отдельные сайты, такие как docs.google.com, пока не поддерживаются.</li>
                <li>Если текст содержит ошибку, но LanguageTool не может обнаружить его, то скорей всего в программе нет правила для
                    обнаружения этой ошибки.  Пожалуйста, <a href="../contribute/">присылайте предложения</a>.
                </li>
            </ul>

       
            <h2>Chrome</h2>

            <p>Для пользователей Chrome мы предлагаем <a href="../chrome/">LanguageTool для Chrome</a>, который работает аналогично этому расширению.</p>

        </div>

    </div>
@endsection
