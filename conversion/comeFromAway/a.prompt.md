Inside this folder is the OCR'ed text from the script of the musical "Come From Away". I've broken the script into chunks. The files have names that start with `chunk<number>` The text has some formatting issues and artifacts from the OCR process. Your task is to clean up the text, correcting any obvious errors.

Please preserve page numbers, which are usually found before or after a repeated title of the show (Come From Away). Every once in a while, "come from away" is actually part of some legitimate dialogue, so be careful not to remove those instances. Use the following as an example of before and after:

```
----BEFORE----
  ~ 4 — COME FROM AWAY
----AFTER-----
[[Page 4]]
```

Here's another example:

```
----BEFORE----
_ aaa aa aaa
CoME From AWAy —~ 13
----AFTER-----
[[Page 13]]
```

In chunk1, page numbers are roman numerals. Keep them as roman numerals. Starting with chunk2, page numbers are never represented as Roman numerals, so if you see something like "iv" or "xii" in the text, it is not a page number and should be left alone or removed if it is just an artifact.

I want you to do all of your work in the files with the `.progress.txt` extension. Leave the `original.txt` files alone. (In fact, you can completely ignore the `original.txt` files because their contents are already transcribed into the `progress.txt` files.)
