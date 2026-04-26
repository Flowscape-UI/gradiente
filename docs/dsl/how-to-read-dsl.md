# 🧠 How to Read Gradient Pattern DSL

Gradient Pattern DSL may look complex at first, but it follows a small set of consistent rules.
This section teaches you how to read any pattern step by step.


## 📌 Start from the boundaries

Every pattern always has:

```txt
^ ... .
```

Read it as:

```txt
Start of pattern
...
End of pattern
```


## 🧠 Example: Basic repeating pattern

### Pattern

```txt
^[color-stop,~color-stop].
```


## 📌 Step 1 - boundaries

```txt
^ - Begin pattern  
. - End of pattern
```

So we know:

> everything between `^` and `.` is the rule we need to read

## 📌 Step 2 - look inside

```txt
[color-stop,~color-stop]
```

This is a **sequence** (`[]`), which means:

```txt
do this, then this
```


## 📌 Step 3 - first element

```txt
color-stop
```

This means:

> the pattern must start with a color-stop


## 📌 Step 4 - second element

```txt
~color-stop
```

The `~` operator means:

```txt
repeat zero or more times
```

So:

```txt
~color-stop
```

means:

> zero or more additional color-stops


## 📌 Step 5 - combine everything

Now combine both parts:

```txt
[color-stop,~color-stop]
```

Becomes:

```txt
one color-stop
then any number of additional color-stops
```

## 📌 Final explanation

```txt
Start of pattern

Expect:
  one color-stop

Then:
  zero or more additional color-stops

End of pattern
```


## 💡 Intuition

You can read this pattern as:

> “at least one color-stop, then as many as you want”


## 🔗 Try it

Open the playground and test:

```txt
color-stop
color-stop, color-stop
color-stop, color-stop, color-stop
```

All of them should be valid.


## 📌 Understand sequence `[]`

```txt
[a,b]
```

Means:

```txt
a then b
```

So:

```txt
[color-stop,~color-stop]
```

Becomes:

```txt
color-stop, then repeat color-stop N-times
```


## 📌 Understand repetition `~`

```txt
~color-stop
```

Means:

```txt
zero or more color-stop
```

So the full meaning:

```txt
at least one color-stop
then any number of additional color-stops
```


## 📌 Final result



```txt
^[color-stop,~color-stop].

`^` - Start of pattern

Expect:
  at least one `color-stop`

Then:
  zero or more additional color-stops

`.` - End of pattern
```


## 📌 Reading OR conditions

Now a more complex pattern:

```txt
(config|color-stop)
```

This means:

```txt
either config
or color-stop
```


## 📌 Combining sequence and OR

```txt
([config,color-stop]|color-stop)
```

Read it as:

```txt
Either:
  config followed by color-stop
Or:
  color-stop
```


## 📌 Reading nested patterns

Example:

```txt
^[([config,color-stop]|color-stop),~color-stop].
```

Step-by-step:

```txt
Start of pattern

Then:
  Either:
    config followed by color-stop
  Or:
    color-stop

Then:
  repeat color-stop

End of pattern
```


## 📌 Color hints

```txt
[color-hint,color-stop]
```

Means:

```txt
a color-hint must always be followed by a color-stop
```


## 🧠 Mental model

Think of DSL as a **set of instructions**:

```txt
Read input from left to right
Match expected tokens
Branch when needed
Repeat when allowed
```


## 🔗 Try it interactively

Reading patterns becomes much easier when you see them visually.

👉 Open the playground to explore patterns interactively:

**[Open DSL Playground →](/playground/dsl)**


## 🚀 Summary

* `^` → BEGIN
* `.` → END
* `[]` → SEQUENCE
* `()` → GROUPPING
* `|` → OR
* `~` → REPETITION (Array)
* `config` → CONFIG (angle, dimension, position)
* `color-stop` → COLOR STOP (red, gren 10% 20%, blue 50%, rgb(1,2,3))
* `color-hint` → COLOR HINT (10%, 20%, 50%) - offset of the gradient intersection point

Once you understand these, you can read any pattern.


## 💡 Tip

Start simple:

```txt
^color-stop.
```

Then gradually add:

```txt
[]
()
|
~
```