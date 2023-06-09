<p align="center">
  <h3 align="center">Solar System Explorer</h3>

  <p align="center">
    An interactive simulation of the solar system's eight planets
  </p>
</p>


## Table of contents

- [Introduction](#introduction)
- [Toggles and Controls](#toggles-and-controls)
- [Running the simulation](#how-to-run-it)
- [Code sources](#code-sources)

## Introduction

The Solar System Explorer enables you to fly a rocketship around the solar system or navigate using the keyboard in order to view the eight planets and sun behaving according to their NASA-provided parameters.

The planets are set to ideal sizes and rotation speeds for viewing, but can be changed to accurate sizes, speeds, or rotation rates using the toggles found below the viewer. Furthermore, the sun has been scaled down to allow for a closer representation of the planets.

The best way to explore this simulation is through the user-controlled rocketship. Pressing t causes the simulation to enter rocketship mode, at which point the ijkl keys re-orient the rocketship and the m key adds thrust to move it forward.

In order to get a wider view of the solar system as a whole, there is also the default view of the entire solar system that can be reset.

In order to pick a specific date, there is a calendar widget below the simulation that will move the planets to their locations on the date selected. Below this widget is a pause/play option, which makes it possible to stop the planets wherever they are in their revolution about the sun. The date widget acts as a start date and does not update as the planets revolve.


## Toggles and Controls

Viewer Shortcuts

| Movement    | Control |
| ----------- | ----------- |
| Forward/Left/Back/Right      | w a s d       |
| Up/Down   | space z        |
| Roll Left/Right | , . |
| Overview      | y       |

Moving the rocket

| Function    | Control |
| ----------- | ----------- |
| Enter rocket mode      | t       |
| Add thrust   | m        |
| Up/Left/Down/Right | i j k l |

Other

| Function    | Control |
| ----------- | ----------- |
| Stop/start revolutions   | Control + 0        |
| Select a date | use date widget |
| Change planet size | first slider |
| Change rotation speed | second slider |
| Change passage of time rate | third slider |

Note: Buttons for controls can be found below the simulation window

## How to run it

The best way to begin running our program is to execute server.py in Python.

Next, navigate to localhost:8000 on your browser.

Please allow a couple seconds for the simulation to finish loading -- the images loaded are high-resolution so it will take a second. After the simulation is done loading, the controls shown above can be used to explore the simulation.

## Code Sources

- [NASA's Approximate Planetary Position Calculations](https://ssd.jpl.nasa.gov/planets/approx_pos.html)
- [CS174A Assignment 3] 
