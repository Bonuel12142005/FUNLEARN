
/*
    MIT License
    
    Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
    Mindoro State University - Philippines

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
    */
    
import express from "express";
import path from "path";
import session from "express-session";
import router from "./routes/index.js";
import fs from 'fs';
import hbs from "hbs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Register Handlebars helpers
hbs.registerHelper('eq', function(a, b, options) {
  // Support both block and subexpression usage
  if (!options || !options.fn) {
    return a === b;
  }
  if (a === b) {
    return options.fn(this);
  } else {
    return options.inverse ? options.inverse(this) : '';
  }
});

hbs.registerHelper('gt', function(a, b, options) {
  // Support both block and subexpression usage
  if (!options || !options.fn) {
    return a > b;
  }
  if (a > b) {
    return options.fn(this);
  } else {
    return options.inverse ? options.inverse(this) : '';
  }
});

hbs.registerHelper('gte', function(a, b, options) {
  // Support both block and subexpression usage
  if (!options || !options.fn) {
    return a >= b;
  }
  if (a >= b) {
    return options.fn(this);
  } else {
    return options.inverse ? options.inverse(this) : '';
  }
});

hbs.registerHelper('lt', function(a, b, options) {
  // Support both block and subexpression usage
  if (!options || !options.fn) {
    return a < b;
  }
  if (a < b) {
    return options.fn(this);
  } else {
    return options.inverse ? options.inverse(this) : '';
  }
});

hbs.registerHelper('and', function(a, b, options) {
  // Support both block and subexpression usage
  if (!options || !options.fn) {
    return a && b;
  }
  if (a && b) {
    return options.fn(this);
  } else {
    return options.inverse ? options.inverse(this) : '';
  }
});

hbs.registerHelper('subtract', function(a, b) {
  return (a || 0) - (b || 0);
});

hbs.registerHelper('add', function(a, b) {
  return a + b;
});

hbs.registerHelper('round', function(num) {
  return Math.round(num || 0);
});

hbs.registerHelper('json', function(context) {
  return JSON.stringify(context, null, 2);
});

hbs.registerHelper('substring', function(str, start, length) {
  if (!str) return '';
  return str.substring(start, start + length);
});

hbs.registerHelper('multiply', function(a, b) {
  return (a || 0) * (b || 0);
});

hbs.registerHelper('divide', function(a, b) {
  if (b === 0) return 0;
  return (a || 0) / (b || 1);
});

hbs.registerHelper('subtract', function(a, b) {
  return (a || 0) - (b || 0);
});

hbs.registerHelper('capitalize', function(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
});

hbs.registerHelper('unless', function(value, options) {
  if (!value) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});





const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), "public")));

app.use(session({
  secret: "xianfire-secret-key",
  resave: false,
  saveUninitialized: false
}));

app.engine("xian", async (filePath, options, callback) => {
  try {
     const originalPartialsDir = hbs.partialsDir;
    hbs.partialsDir = path.join(__dirname, 'views');

    const result = await new Promise((resolve, reject) => {
      hbs.__express(filePath, options, (err, html) => {
        if (err) return reject(err);
        resolve(html);
      });
    });

    hbs.partialsDir = originalPartialsDir;
    callback(null, result);
  } catch (err) {
    callback(err);
  }
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "xian");
const partialsDir = path.join(__dirname, "views/partials");
fs.readdir(partialsDir, (err, files) => {
  if (err) {
    console.error("❌ Could not read partials directory:", err);
    return;
  }

   files
    .filter(file => file.endsWith('.xian'))
    .forEach(file => {
      const partialName = file.replace('.xian', ''); 
      const fullPath = path.join(partialsDir, file);

      fs.readFile(fullPath, 'utf8', (err, content) => {
        if (err) {
          console.error(`❌ Failed to read partial: ${file}`, err);
          return;
        }
        hbs.registerPartial(partialName, content);
        
      });
    });
});

app.use("/", router);

export default app;

if (!process.env.ELECTRON) {
  app.listen(PORT, () => console.log(`🔥 XianFire running at http://localhost:${PORT}`));
}
