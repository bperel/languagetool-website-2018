@extends('layouts.app')

@section('title', 'Impressum')
@section('noindex')
    <meta name="robots" content="noindex">
@stop

@section('content')
    <div id="textContent" class="content-section" style="text-align: left">
        <div class="container">

            <?php if (app()->getLocale() == "de") { ?>

                <h1>Impressum</h1>

                <p><strong>Wenn Sie Support benötigen, besuchen Sie <a href="https://forum.languagetool.org">unser Forum</a>.</strong></p>

                <p>
                    LanguageTooler GmbH<br/>
                    Karl-Liebknecht-Str. 21/22<br/>
                    14482 Potsdam<br/>
                    Telefon: +49 331 97 990 79<br/>
                    Geschäftsführer: Daniel Naber<br/>
                    Handelsregister: Amtsgericht Potsdam HRB 30269 P<br/>
                    USt-IdNr: DE315084345<br/>
                    E-Mail: <span style="color:#555555">daniel.naber <span>a&#116;</span> languagetool<span>.</span>org</span>
                </p>

                <h2>Förderung durch die Europäische Union</h2>
            
                <p><a href="/dev/#funding">Siehe unsere Entwickler-Seite</a></p>

            
                <h2>Verfügbarkeit</h2>

                <p>languagetool.org ist eine kostenlose Website zur Prüfung von Texten. Wir geben keine Garantien
                    über die Verfügbarkeit, Geschwindigkeit, Fähigkeiten oder Qualität der Software. Wir geben auch
                    keine Garantien darüber, welche Version der Software auf der Website läuft, oder welche Version
                    in Zukunft auf der Website laufen wird.</p>

                <h2>Streitbeilegungsverfahren</h2>

                <p>Wir nehmen nicht an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teil.
                    Gemäß der EU-Verordnung Nr. 524/2013 sind wir jedoch verpflichtet, darauf hinzuweisen, dass die
                    Europäische Kommission unter <a href="http://ec.europa.eu/consumers/odr/">http://ec.europa.eu/consumers/odr/</a>
                    eine Plattform zur außergerichtlichen Online-Streitbeilegung (sog. OS-Plattform) betreibt.</p>

                <h2>Haftungsbeschränkung</h2>

                <p>languagetool.org kann nicht zur Verantwortung gezogen werden für angebliche oder tatsächliche Schäden,
                    die Ihnen durch die Nutzung von languagetool.org entstehen, auch nicht, wenn unser Dienst aus egal
                    welchen Gründen nicht verfügbar ist.</p>

                <h2>Lizenz</h2>

                <p>Der Inhalt dieser Website steht unter <a href="http://creativecommons.org/licenses/by-sa/3.0/">CC BY-SA 3.0</a>.
                    Die Software, LanguageTool, steht unter <a href="http://www.gnu.org/licenses/old-licenses/lgpl-2.1">LGPL 2.1</a> oder neuer.
                    Diese Website benutzt einige Icons von <a  href="http://www.fatcow.com/free-icons">FatCow</a>,
                    die unter <a href="http://creativecommons.org/licenses/by/3.0/us/">CC BY 3.0</a> zur Verfügung stehen.
                    Der benutzte Font ist <a href="https://www.google.com/fonts/specimen/Source+Sans+Pro">Source Sans Pro</a> von Adobe,
                    verfügbar unter der <a href="http://scripts.sil.org/cms/scripts/page.php?site_id=nrsi&id=OFL">SIL Open Font License, 1.1</a>.</p>

                <h2>Datenschutz</h2>

                <p>Siehe unsere <a href="privacy">Datenschutzerklärung</a>.</p>

            <?php } else { ?>

                <h1>Imprint</h1>

                <p><strong>If you need help, visit <a href="https://forum.languagetool.org">our forum</a>.</strong></p>

                <p>
                    LanguageTooler GmbH<br/>
                    Karl-Liebknecht-Str. 21/22<br/>
                    14482 Potsdam<br/>
                    Phone: +49 331 97 990 79<br/>
                    CEO: Daniel Naber<br/>
                    Trade Register: Amtsgericht Potsdam HRB 30269 P<br/>
                    VAT no.: DE315084345<br/>
                    email: <span style="color:#555555">daniel.naber <span>a&#116;</span> languagetool<span>.</span>org</span>
                </p>

                <h2>Funding by the European Union</h2>

                <p><a href="/dev/#funding">See the development page</a></p>
            
                <h2>Availability</h2>

                <p>languagetool.org offers a free service to automatically proofread text. There are no guarantees
                    about availability, features, performance, or quality. There are no guarantees about a specific version of the
                    proofreading software running, nor about future updates.</p>

                <h2>Dispute Resolution</h2>

                <p>We do not participate in out-of-court online dispute resolution.
                    According to EU Regulation No. 524/2013, however, we are obliged to point out that the European
                    Commission operates a platform for out-of-court online dispute resolution (so-called OS platform)
                    at <a href="http://ec.europa.eu/consumers/odr/">http://ec.europa.eu/consumers/odr/</a>.</p>

                <h2>Limitation of Liability</h2>

                <p>languagetool.org shall not be responsible for any claimed damages, including incidental and consequential damages,
                    which may arise from the use of languagetool.org or from languagetool.org’s servers going offline or being
                    unavailable for any reason whatsoever.</p>

                <h2>Licenses</h2>

                <p>The contents of this homepage is available under <a href="http://creativecommons.org/licenses/by-sa/3.0/">CC BY-SA 3.0</a>.
                    The software, LanguageTool, is available under <a href="http://www.gnu.org/licenses/old-licenses/lgpl-2.1">LGPL 2.1</a> or later.
                    This page uses some icons provided by <a  href="http://www.fatcow.com/free-icons">FatCow</a>
                    which are available under <a href="http://creativecommons.org/licenses/by/3.0/us/">CC BY 3.0</a>.
                    <!-- see images/(information|exclamation|accept).png in ltcommunity -->
                    The font used is <a href="https://www.google.com/fonts/specimen/Source+Sans+Pro">Source Sans Pro</a> from Adobe,
                    available under <a href="http://scripts.sil.org/cms/scripts/page.php?site_id=nrsi&id=OFL">SIL Open Font License, 1.1</a>.</p>

                <h2>Privacy</h2>

                <p>Please see <a href="privacy">our privacy policy</a>.</p>

            <?php } ?>
        
        </div>
    </div>
@endsection
