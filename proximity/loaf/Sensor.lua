-- sensor class, checks proximity to pos
-- Copyright (c) 2021 Dan Wilcox ZKM | Hertz-Lab

local Sensor = class()

-- init with pos and range in pixels
function Sensor:__init(x, y, range)
	self.pos = glm.vec2(x, y)
	self.range = range
	self.proximity = 0 -- normalized
end

-- check proximity to pos, returns true if sensor value has changed
function Sensor:update(pos)
	local d = glm.fastDistance(self.pos, pos)
	local p = of.clamp(of.map(d, 0, self.range, 1, 0), 0, 1)
	if p ~= self.proximity then
		self.proximity = p
		return true
	end
	return false
end

function Sensor:draw(pos)
	-- of.setColor(100, 200, 100, 100)
	-- of.drawCircle(self.pos, self.range)

	if self.proximity > 0 then
		of.setColor(100, 200, 100, 100)
		of.setLineWidth(20 * self.proximity)
		of.drawLine(self.pos, pos)
		of.setLineWidth(1)
	end

	of.setColor(40)
	of.drawCircle(self.pos, 10)
end

return Sensor
