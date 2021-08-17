-- proximity sensor simulator
-- Copyright (c) 2021 Dan Wilcox ZKM | Hertz-Lab

-- classes
local Person = require "Person"
local Artwork = require "Artwork"
local Sensor = require "Sensor"

-- instances
local person = nil
local artwork = nil
local sensor = nil

-- main

-- default port, can be overridden by --port arg
loaf.setSendPort(5005)

function setup()
	of.setWindowTitle("proximity")
	of.background(120)
	of.setCircleResolution(50)
	of.enableAlphaBlending()

	local w = of.getWidth()
	local h = of.getHeight()
	person = Person(w * 0.5, h * 0.85, 40)
	artwork = Artwork(w * 0.25, h * 0.1, w * 0.5, h * 0.05)
	sensor = Sensor(w * 0.5, h * 0.2, 300)

	loaf.send("/proximity", sensor.proximity)
end

function update()
	if sensor:update(person.pos) then
		loaf.send("/proximity", sensor.proximity)
	end
end

function draw()
	sensor:draw(person.pos)
	artwork:draw()
	person:draw()

	-- value as string
	of.setColor(255)
	of.drawBitmapString(string.format("%0.2f", sensor.proximity), 6, 12)

	-- value as progress bar
	of.setColor(40, 40, 40, 200)
	of.drawRectangle(6, 16, 100, 12)
	of.setColor(100, 200, 100, 200)
	of.drawRectangle(6, 16, 100 * sensor.proximity, 12)
end

function mouseMoved(x, y)
	person:mouseMoved(x, y)
end

function mousePressed(x, y, button)
	person:mousePressed(x, y)
end

function mouseDragged(x, y, button)
	person:mouseDragged(of.getPreviousMouseX(), y)
end

function mouseReleased(x, y, button)
	person:mouseReleased(x, y)
end

function mouseExited(x, y)
	person:mouseExited(x, y)
end
