@extends('layouts.app')

@section('title', 'LanguageTool Support')

@section('content')
    <div id="textContent" class="content-section">
        <div class="container">

            <h1>Support</h1>
        
            <p>If you have a problem with LanguageTool, please make sure to read the
                    <a href="/issues">checklist</a> first.</p>
        
            <ul>
                    <li style="font-size: large"><a href="https://forum.languagetool.org/"><strong>Post to our forum</strong></a> - this is the easiest way of contacting us</li>
                    <li>If you absolutely don't want to post to public forums or mailing lists, contact the maintainers directly:
                        <ul>
                            <li><a href="http://www.danielnaber.de">Daniel Naber</a> - contact by sending an email to
                                    <span style="color:#777777">naber <span>a&#116;</span> danielnaber<span>.</span>de</span></li>
                            <li><a href="http://marcinmilkowski.pl">Marcin Miłkowski</a> - contact by using his
                                    <a href="http://marcinmilkowski.pl/en/contact-me">contact form</a></li>
                        </ul>
                    </li>
                    <li><strong><a href="/newsletter">Announcement mailing list</a></strong> - low traffic,
                            you will only receive emails about new LanguageTool releases and major new features</li>
            </ul>

        </div>
            
    </div>

@endsection
