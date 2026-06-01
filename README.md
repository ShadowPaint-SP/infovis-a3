InfoVis Assignment 3
This repository contains the bare-bones files to start up and solve the third assignment of the InfoVis course at TU Dresden.

Local development:
Start a local web server from the project folder:

```zsh
python3 -m http.server 8000
```

Then open http://localhost:8000.

Alternative with Node.js:
Install serve using:

npm install serve --global

And start the application using

serve -p 8000

You should then be able to see your website at http://localhost:8000.

Note: feel free to explore other development environments such as Vite, Flask (python), etc.

Debugging:
Feel free to make extensive use of your browser's development tools! In chrome-based browsers, you can simply use Ctrl+J to open the browser console, which will show all the console.log and similar that you write in the code.


# AI Usage

We used AI for concept explanation like figuring out what certain things of the D3 library do.
Also used AI for debugging small issues, for example we got the linked brushing working but one chart didnt properly update when deselecting. AI pointed out where the issue was and fixed it. 

AI provider used: ChatGPT with `GPT5.5-medium`
