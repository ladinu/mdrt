mdrt
====

Experimental markdown preview app to be used with vim

## Basic Usage

First start mdrt
``sh
$ node mdrt.js ~/path/to/file.md
``
Point browser to address http://127.0.0.1:9090/

Then open vim and connecect to mdrt: `:nbs 127.0.0.1:8080`

Start typing and you should see result in the browser
