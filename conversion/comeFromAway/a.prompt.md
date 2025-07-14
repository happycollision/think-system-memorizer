Inside this folder is the OCR'ed text from the script of the musical "Come From Away". I've broken the script into chunks. The files have names that start with `chunk<number>.progress.txt` The text had some formatting issues and artifacts from the OCR process that you helped me correct in a previous session.

Now, I'd like to convert all this text into the fountain format for memorization.

1. Clean up remaining OCR artifact issues if there are any. (There are probably a few.)
2. Do not correct any grammar! These lines are written in the voice and dialect of the characters.
3. Here are things you should know to do the Fountain conversion:

   - When characters are singing, this script denotes that by using ALL CAPS. Fountain uses a starting tilde (~) instead, so you can correct the capitalization and use a tilde.
   - In the script, songs are marked with a starting pound, number, optional letter, dash, then title (example: #8a - Bonnie in the Holds). The OCR may have strange artifacts at different times. You should always use a hyphen in the final transcription. You can transcribe them as markdown heading 1 (#), number and optional letter, colon, title. (example: # Song 8a: Bonnie in the Holds).
   - For new scenes (like "Scene 1"), go ahead and force a new scene heading by putting a period at the start of the line (like ".Scene 1"). Be sure that all scene headings have a blank line before and after them.
   - For continuous dialogue or singing, please be on the lookout for lines that are actually stage directions—which should be surrounded with blank lines—and for new character cues Here's an example:

     ```
     MEN
     WELCOME TO THE ROCK
     WOMEN
     I’M AN ISLANDER, I AM AN ISLANDER
     ALL
     I’M AN ISLANDER, I AM AN ISLANDER
     I’M AN ISLANDER, I AM AN ISLANDER
     I'M AN ISLANDER, I AM AN ISLANDER
     OZ
     That morning I’m in my car. The kids cross Airport Boulevard to get to school —and
     that time a day people are in a little bit of a rush to get to work and stuff, so
     normally I sit there and run my radar.
     OZ cues the cast to make a “WOOP-WOOP” noise together.
     And if they're speeding, I'll stop ‘em and write out a warning ticket. I'll write
     “STFD” - Slow The Fuck Down.
     ACTOR 2
     WELCOME TO THE LAND WHERE THE WINTERS TRIED TO KILL US
     AND WE SAID
     ALL
     WE WILL NOT BE KILLED
     ```

     should become

     ```
     MEN
     ~Welcome to The Rock

     WOMEN
     ~I'm an islander, I am an islander

     ALL
     ~I'm an islander, I am an islander
     ~I'm an islander, I am an islander
     ~I'm an islander, I am an islander

     OZ
     That morning I’m in my car. The kids cross Airport Boulevard to get to school —and
     that time a day people are in a little bit of a rush to get to work and stuff, so
     normally I sit there and run my radar.

     OZ cues the cast to make a “WOOP-WOOP” noise together.

     OZ (CONT'D)
     And if they're speeding, I'll stop ‘em and write out a warning ticket. I'll write
     “STFD” ~—Slow The Fuck Down.

     ACTOR 2
     ~Welcome to the land where the winters tried to kill us
     ~And we said

     ALL
     ~We will not be killed
     ```

   - Be _very conscious_ of singing vs dialogue. Singing will always be full lines of ALL CAPS. Any dialogue that is not all caps is, therefore _not_ singing. Some lines that are all caps are character names.
   - Some characters speak at the same time, and that will be hard to detect. Try to keep obvious dialogue together. It will be difficult. Here is an example:

     ```
     STAFF 6 STAFF 8 STAFF 12 STAFF 4 STAFF 1 STAFF 2

     You need Well cancel Don't look Now there's That Rogers Until further

     to talk to the effing at me! It's five vats of -- girl does NOT notice? What

     Health food too! not my chilli. My know what does that

     Canada decision! uncle hasa she's doing. mean?

     STAFF 12

     We also need that girl at Rogers to announce that rotary, hockey, boys and girls club

     --everything's cancelled until further notice.

     truck
     ```

     You will have no way of knowing that character STAFF 12 is actually the first line before all of this mess, so don't try and fix that. But you _might_ be able to use context clues to piece all the other lines back together properly, using the carat to indicate concurrent dialogue. In the end, the example above should read like this (where I have manually reordered that very first line to where it goes):

     ```
     STAFF 12
     We also need that girl at Rogers to announce that rotary, hockey, boys and girls club--everything's cancelled until further notice.

     STAFF 6
     You need to talk to Health Canada

     STAFF 8 ^
     Well cancel the effing food too!

     STAFF 12 ^
     Don't look at me! It's not my decision!

     STAFF 4 ^
     Now there's five vats of chili. My uncle has a truck

     STAFF 1 ^
     That Rogers girl does NOT know what she's doing.

     STAFF 2 ^
     Until further notice? What does that mean?
     ```

4. Finally, please feel free to use any knowledge you already have about the script for _Come From Away_ to help correct the formatting and dialogue from remaining OCR problems—lines out of order, missing punctuation, etc. But do not change any of the actual words or grammar. Only fix formatting and obvious OCR issues.
