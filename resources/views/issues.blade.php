@extends('layouts.app')

@section('title', 'Checklist in Case of Problems - LanguageTool')

@section('content')
    <div id="textContent" class="content-section" style="text-align: left">
        <div class="container">

            <h1>Checklist in Case of Problems</h1>

            <ul>
                    <li>Make sure <a href="http://www.java.com/en/download/manual.jsp">Java 8 or later from Oracle</a>
                            is installed on your system. If you use the 32-bit version of LibreOffice/OpenOffice.org, you will also
                            need to use the 32-bit version of Java (same for the 64-bit version).
                            Java versions which are not from Oracle may not work. If you're using an
                            old version of Java you'll see a confusing error message <a href="/images/issues/version-error.jpg">like this</a>.</li>
                    <li>LanguageTool 4.5.1 seems to be incompatible with Debian's outdated, stable version LibreOffice 5.2.7.2 (<a href="https://forum.languagetool.org/t/languagetool-4-5-1-crashes-libreoffice/4174/6">source</a>)</li>
                    <li>If you get an error that says <strong>Invalid memory access</strong>, make sure LanguageTool is installed in a path
                            that has no special characters (use a-z, A-Z and 0-9 only).
                    <li>If installation of LanguageTool in LibreOffice/OpenOffice didn't throw an error but you are not sure if it
                            actually works, please <strong><a href="/files/languagetool-test.odt">load this document</a></strong> and follow the instructions in it.</li>
                    <li>If you see different results locally and on languagetool.org, that's for two reasons:
                            <ul style="margin-top: 8px">
                                    <li>We usually run the latest version on languagetool.org which might have more rules than the latest release version.</li>
                                    <li>For English, German, French, Spanish: We have some additional rules on languagetool.org that require large data
                                            sets not part of the download version (<a href="http://wiki.languagetool.org/finding-errors-using-n-gram-data">technical details</a>).</li>
                            </ul>
                    </li>
                    <li><strong>For Mac users:</strong> LanguageTool requires Java 8 or later, which is available for the Mac only as a 64 bit version.
                            You need <strong>the 64-bit version of LibreOffice 4.2 or later</strong> in order to use LanguageTool on a Mac
                            <strong>and you <em>also</em> need to have '<a href="http://support.apple.com/kb/DL1572">Java for OS X</a>' installed</strong>,
                            additionally to Java&nbsp;8 (Source: <a href="https://bugs.freedesktop.org/show_bug.cgi?id=74877">#74877</a>).
                            <br/><span class="oldInformation">Older versions of LibreOffice and OpenOffice are only available in 32 bit, leading to an incompatibility so that LanguageTool
                            cannot be used with these versions as a LibreOffice/OpenOffice add-on on the Mac. The only known workaround for these older versions is to use
                            LanguageTool 2.2, which is still available from the <a href="http://languagetool.org/download/">download archive</a>, for which a 32 bit version
                            of Java 6 still exists. LanguageTool 2.2 also works with Java 6.</span></li>
                    <li>LibreOffice comes with its own integrated grammar checker (LightProof) which disables LanguageTool for
                            English and Russian.
                            Use Options -> Language Settings -> Writing aids -> Edit... to disable LightProof and enable LanguageTool for the language
                            you are working with to make LanguageTool work.</li>
                    <li>Make sure Java 8 or later from Oracle is selected in LibreOffice (<em>Tools -> Options -> Advanced</em>) or
                            OpenOffice.org (<em>Tools -> Options -> Java</em>). For Mac users: LibreOffice (<em>Preferences -> LibreOffice -> Advanced</em>).</li>
                    <li>Did you restart LibreOffice/OpenOffice.org - including the QuickStarter - after installation of LanguageTool? This is required,
                            even though there is no dialog saying so. (<a href="https://bugs.freedesktop.org/show_bug.cgi?id=46279">#46279</a><!--, <a href="http://issues.apache.org/ooo/show_bug.cgi?id=88692">#88692</a>-->)</li>
                    <li>If LanguageTool doesn't start and you see no error message, please
                            check if the extension is enabled in the Extension manager
                            (under <em>Tools -&gt; Extension Manager</em>).</li>
            </ul>

            <a name="office"></a>
            <h2>Common Problems with LibreOffice/OpenOffice.org Integration</h2>

            <ul>

                    <li>Note that if you have a <strong>32-bit version of LibreOffice/OpenOffice</strong>, you will also need a 32-bit version of Java - LanguageTool will not
                            work otherwise. Apache OpenOffice doesn't provide official 64-bit versions for Windows and Mac yet, so you will need a 32-bit Java
                            on Windows and Mac.</li>

                    <li>If you get <strong>"Could not create Java implementation loader"</strong>, please work through
                            <a href="http://www.zotero.org/support/word_processor_plugin_troubleshooting#could_not_create_java_implementation_loader">these suggestions</a>.
                            <strong>Note: </strong> if you have this problem on 64-bit Windows,
                            it may be caused by a 64-bit version of Java. Apache OpenOffice on Windows is only built as a 32-bit application
                            and will not work with a 64-bit Java. You need to use a <a href="http://www.java.com/en/download/faq/java_win64bit.xml#Java for 32-bit">32-bit build of Java for Windows</a>.
                            (<a href="https://issues.apache.org/ooo/show_bug.cgi?id=118346">OOo bug #118346</a>)
                    </li>

                    <li><strong>On Ubuntu</strong>, install the <tt>libreoffice-java-common</tt> package by calling this command in a terminal:<br>
                            <tt>sudo apt-get install libreoffice-java-common</tt><br>
                            One problem solved by this is getting a long error message with "NoClassDefFoundError" during installation
                            (<a href="../images/class_not_found.png">see screenshot</a>).</li>

                    <li><strong>On Ubuntu</strong>, if you get a message similar to <tt>Exception in thread "Thread-402" java.awt.HeadlessException</tt> in LibreOffice/OpenOffice,
                            see <a href="http://stackoverflow.com/questions/5362512/unable-to-run-java-gui-programs-with-ubuntu/5362572#5362572">this stackoverflow answer</a>.
                            Note that the message might not appear in a dialog but only on the command line, so you might want to start LibreOffice/OpenOffice from a terminal window.</li>

                    <li>If you get <strong>"This media-type is not supported: application/vnd.sun.star.package-bundle2.0.00"</strong> during installation, please consider
                            <a href="http://user.services.openoffice.org/en/forum/viewtopic.php?p=58403#p58403">resetting your OpenOffice user profile</a>.</li>

                    <li>If you get <strong>Failed to load rules for language ... Caused by java.lang.ClassNotFoundException: Loading rules failed: Duplicate class definition</strong>:
                            For some reason LanguageTool is installed twice as an extension in OpenOffice.org. You can try deleting the directories listed
                            in the error message after making a backup. (The directories to be deleted have random names like "EE31.tmp_" or similar - exit OpenOffice.org
                            before deleting anything).</li>

                    <li>The <strong>menu items in LibreOffice/OpenOffice.org get mixed up</strong> when both <a href="http://open.afterthedeadline.com/">After the Deadline</a>
                            and LanguageTool are installed. <a href="http://www.oooforum.org/forum/viewtopic.phtml?t=122665#428635">The macro</a> mentioned here
                            might help you. This issue is tracked as <a href="http://openatd.trac.wordpress.org/ticket/215">ticket #215 at After the Deadline</a>.</li>

                    <li>If you start LibreOffice/OpenOffice from the command line and you get a <strong>NoClassDefFoundError</strong>, make
                            sure you're <em>not</em> starting LibreOffice/OpenOffice from the LanguageTool installation directory.</li>

                    <li>We have received reports from people that a re-installation of LanguageTool in LibreOffice/OpenOffice might be needed
                            to make it work after the other issues have been resolved.<!-- Alex, private email 2015-09-18 --></li>

            </ul>

            <a name="limitations"></a>
            <h2>Known Limitations</h2>

            <ul>
                    <li>Some errors are not detected: LanguageTool uses rules to detect errors, i.e. it will only complain about errors for which there
                            is a rule that detects it. Please consider learning <b><a href="http://wiki.languagetool.org/development-overview#toc0">how to write rules</a></b> and
                            <b><a href="http://wiki.languagetool.org/make-languagetool-better">help make LanguageTool better</a></b> by contributing your rules.</li>
                    <!--<li>Some rules that work across sentences don't work in LibreOffice/OpenOffice.org. This also affects the rule that checks whether
                        three sentences start with the same word.</li>-->
                    <!--<li>For some rules there are a lot of false alarms, i.e., LanguageTool complains about text which is actually correct</li>-->
                    <li>LanguageTool doesn't work correctly with documents that contain revisions
                            (<a href="https://bugs.freedesktop.org/show_bug.cgi?id=36540">LibreOffice #36540</a>, <a href="https://issues.apache.org/ooo/show_bug.cgi?id=92013">OO #92013</a>)
                    </li>
            </ul>

            <h2>Still need Help?</h2>

            <p>If LanguageTool still doesn't work properly for you, please <a href="https://forum.languagetool.org">post to the forum</a> describing the problem
                    and letting us know which version of LanguageTool, LibreOffice/OpenOffice.org and which operating system you are using.</p>

        </div>
            
            </div>
    </div>

@endsection
