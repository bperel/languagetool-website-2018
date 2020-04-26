@extends('layouts.app')

@section('title', 'LanguageTool Team')

@section('content')
    <div id="textContent" class="content-section section-team" style="text-align: left">
        <div class="container">

            <h1>Team</h1>

            <p>LanguageTool is an Open Source application developed by a group of language enthusiasts and software developers.</p>

            <h2>Want to join us?</h2>

            <p>Please join our <a href="https://forum.languagetool.org/">forum</a>,
                where all the discussion happens.</p>


            <h2>Core Team</h2>

            <ul class="multicol">
                <li>Andriy Rysin
                <li>Christopher Blum
                <li><a href="http://www.danielnaber.de">Daniel Naber</a>
                <li><a href="http://dominiko.livejournal.com/tag/lingvoilo">Dominique Pellé</a>
                <li><a href="http://github.com/ebraminio">Ebrahim Byagowi</a>
                <li><a href="http://www.linkedin.com/pub/elanjelian-venugopal/18/955/b86">Elanjelian Venugopal</a>
                <li>Fred Kruse
                <li>Jan Schreiber
                <li>Jaume Ortolà
                <li><a href="http://languagetool-es.blogspot.com/">Juan Martorell</a>
                <li>Konstantin Ladutenko
                <li><a href="http://marcinmilkowski.pl/">Marcin Miłkowski</a>
                <li><a href="http://www.marcoagpinto.com">Marco A.G.Pinto</a>
                <li>Markus Brenneis
                <li>Matheus Poletto
                <li>Matthias Mailänder
                <li>Mike Unwalla
                <li>Panagiotis Minos
                <li><a href="http://it.linkedin.com/in/paolobianchini/">Paolo Bianchini</a>
                <li><a href="https://robinvandervliet.com">Robin van der Vliet</a>
                <li>Ruud Baars
                <li>Stefan Lotties
                <li>Xavi Ivars
                <li><a href="http://myooo.ru/content/view/83/43/">Yakov Reztsov</a>
            </ul>

            <h2>Contributors</h2>

            <p>The following people have contributed rules or source code to LanguageTool. Thank you!</p>

            <!-- source: our changelog and git log searched for "by", "thanks", and "contribute" -->
            <ul class="multicol" style="padding-bottom: 1em">
                <li>Agnese Dal Borgo
                <li>Agnes Souque
                <li>Albert Jané
                <li>Albrecht Müller
                <li>Alexander Socop Arango
                <li>Alex Buloichik
                <li>Alireza Eskandarpour Shoferi
                <li>Allan Borra
                <li>Ankit
                <li>Annika Nietzio
                <li>Anton Karl Ingason
                <li>Arle Lommel
                <li>atrons
                <li>Camille Moulin
                <li>Caolán McNamara
                <li>Chase Tingley
                <li>Christopher Blum
                <li>Dawid Weiss
                <li>Dean Doscher
                <li>Denis Arnaud
                <li>Derek M Jones
                <li>Dmitri Gabinski
                <li>Edward Sanford Sutton
                <li>Eike Rathke
                <li>Elena Cejas
                <li>Eleonora
                <li>Esben Aaberg
                <li>Fabio Rainone
                <li>Felix Sasaki and his students
                <li>Fulup Jakez
                <li>Heikki Lehvaslaiho
                <li>Henrik Bendt
                <li>Hiroki Yatsu
                <li>Hugo Voisard
                <li>Ilona Kuzmickaja
                <li>Ionuț Păduraru
                <li>Irvine
                <li>jab
                <li>D. Jentsch
                <li>Jarek Lipski
                <li>Jimmy O'Regan
                <li>Jitesh V. S.
                <li>John Andrews
                <li>Jordi Mas
                <li>Joseph Monfort
                <li>Jozef Licko
                <li>Julian von Heyl
                <li>Julia Semenenko
                <li>Kevin Scannell
                <li>Kira Goncharova
                <li>Kumara Bhikkhu
                <li>Maksym Davydov
                <li>Mantas Kriaučiūnas
                <li>Martin Srebotnjak
                <li>Matúš Matula
                <li>Maxim Mozgovoy
                <li>metal3d
                <li>Metathesis
                <li>Michael Baumann
                <li>Michael Bryant
                <li>mik09
                <li>Mike Detwiler
                <li>Mike Unwalla
                <li>Mikhail Korobov
                <li>Mikkel Thomsen
                <li>Mility
                <li>Milos Sramek
                <li>Nathaniel Oco
                <li>Nathan Wells
                <li>Nick Hough
                <li>Niki Hansche
                <li>Niklas Johansson
                <li>NOKUBI Takatsugu
                <li>Oliver Schlöbe
                <li>Olivier R.
                <li>OpenTaal
                <li>paolobenve
                <li>Andreas "PAX" Lück
                <li>Pere Farrando
                <li>Peter Lawrence
                <li>Petra Galuscakova
                <li>Petr Mladek
                <li>Philipp Wiesemann
                <li>Philippe Basciano-Le Gall
                <li>PhilippeW
                <li>Radovan Garabík
                <li>Ramon Torrents
                <li>Rémy Léone
                <li>Reza1615
                <li>Ricard Roca
                <li>Riccardo Murri
                <li>Richard Eckart de Castilho
                <li>rob144
                <li>Salino01
                <li>Sander van Geloven
                <li>Serkan Kaba
                <li>Shameera
                    <!--<li>Shugyousha = Silvan -->
                <li>Silvan Jegen
                <li>Sławek Borewicz
                <li>Srinath Warrier
                <li>Stefan Carpentier
                <li>sumit
                <li>Susana Sotelo Docio
                <li>TaalTik
                <li>Takahiro Shinkai
                <li>Tao Lin
                <li>Thai
                <li>Tiago F. Santos
                <li>thatkookooguy
                <li>Thierry Vignaud
                <li>Thomas Menari
                <li>Tugdual Kalvez
                <li>uma
                <li>Viljar
                <li>Vincent Maubert
                <li>Wolfgang Lenhard
                <li>Xesús González Rato
                <li>yeryry
                <li>Zdenko Podobný
            </ul>

            <p>LanguageTool has a history of more than 10 years, so we probably have missed some
                contributors. If you should be on the list, please let us know and we'll add you.</p>

            <p>See the <a href="/languages">list of supported languages</a> for information about who maintains the error
                detection rules for each language.</p>

            <h2>Need Help?</h2>

            <p>Please visit the <a href="/support/">support page</a>.</p>


        </div>
    </div>
@endsection
