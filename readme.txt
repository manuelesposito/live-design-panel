=== Live Design Panel ===
Contributors: manuelesposito
Tags: style sharing, typography, fonts, dark mode, styles
Requires at least: 6.6
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 0.15.58
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Design your site on the live page: colours, fonts, sizes, light and dark. Save styles, share them, and paste in styles from other sites.

== Description ==

Live Design Panel puts a small button on your site. Press it and a panel opens, on the real page, with dials for colours, fonts, text sizes, line spacing, light and dark. Turn a dial and the page changes in front of you. When it looks right, save it as a style.

The panel works on block themes. It does not touch your theme's design: until you move a dial, the page is exactly what your theme draws, and the Original tile gives that back at any time.

**For you, the owner:**

* Dials for the page colour, the text ink and the accent, in light and dark.
* A font library of more than 80 open licensed faces, fetched only when you pick one and then served from your own site.
* Text sizes, line spacing, and a dial per kind of text: headings, reading text, quotes, small print, the interface.
* Save any state of the dials as a style, publish the ones you like, and set one as the site's default.

**Share styles between sites:**

Every style you build can travel. Copy it as a link, and anyone with the plugin pastes that link into their own panel: the whole style arrives, ready to use and to change. Turn on "Everyone can copy styles" and your visitors get a Copy style button too, so a style they like on your site can be on theirs a minute later. No account, no download, no marketplace: a style is just a link, so styles can be passed around by email, in a post or in a chat.

**For your readers:**

A reader gets a smaller panel: reading size, light and dark, and the styles you chose to publish. You decide how much of it they see, or you hide the button for readers entirely. A reader's choices are saved in their own browser and never sent anywhere.

**Beta.** The plugin is in daily use on [elmastudio.de/en](https://elmastudio.de/en) and is being improved all the time. If something looks wrong on your theme, please say so in the support forum; reports about specific themes are the most useful thing you can send.

== Installation ==

1. In your WordPress admin, go to Plugins, Add New, and search for "Live Design Panel". Or upload the plugin zip there.
2. Activate the plugin.
3. Open your site while you are logged in. Press the Live Design button on the page (or Alt+D) and the panel opens.

Nothing on your site changes until you move a dial.

== External services ==

The plugin's font library is not inside the plugin, because that would make it a very large download. When you, the site owner, pick a font for the first time, your server fetches that font's files and its licence text once from jsDelivr (cdn.jsdelivr.net), an open source CDN, and stores them in your own uploads folder. From then on the font is served by your site.

* What is sent: the request for the font file itself. No personal data, no content of your site.
* When: only when a logged in administrator picks a font that is not yet on the site. Visitors never trigger it and their browsers never connect to jsDelivr.
* The addresses are pinned to exact versions and listed in the plugin file font-files.json.

jsDelivr terms of service: https://www.jsdelivr.com/terms
jsDelivr privacy policy: https://www.jsdelivr.com/terms/privacy-policy

No other outside service is used. The plugin has no analytics, no accounts and it does not phone home.

== Frequently Asked Questions ==

= Does it work with my theme? =

The panel is at home in Architrave, the block theme it was made with, which will soon be available for free on wordpress.org. On other block themes it is tested on Twenty Twenty-Five. It should work on other themes too; if something does not look right on yours, please tell us in the support forum.

= Will it change how my site looks the moment I activate it? =

No. It adds the small button, and nothing else changes until you move a dial. The Original tile always returns the theme's own design.

= Where are my readers' settings stored? =

In their own browsers only. The plugin stores one thing on your server: the styles you publish, in a single WordPress option.

= Does the other person need the plugin to use a style I share? =

Yes. A style link opens in the Live Design Panel, so the site it is pasted into needs the plugin too. The theme there can be a different one: the style carries colours, fonts and sizes, and the panel applies them to whatever theme the site uses.

= Is it safe to paste a style someone sent me? =

Yes. A style is only design settings: colours, fonts, sizes and switches. When you paste one, the panel reads it through a list of allowed settings and drops everything else, including any value that could carry code. A pasted style is also only yours until you choose to show it to everyone.

= What happens when I uninstall it? =

The fetched fonts and the published styles are deleted. Your theme is exactly as it was.

= Why do some names in the code say "architrave"? =

The panel grew inside the Architrave theme before it became this plugin, and the internal names stayed so that saved styles keep working. They are used as a unique prefix throughout.

= Where is the source code? =

The readable source and the build scripts are at https://github.com/manuelesposito/live-design-panel. Some shipped files are generated by those scripts; the repository holds what they are generated from.

== Changelog ==

= 0.12.0 =
* First public release.

== Upgrade Notice ==

= 0.12.0 =
First public release.
