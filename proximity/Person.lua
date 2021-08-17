-- person class, click and drag to move
-- Copyright (c) 2021 Dan Wilcox ZKM | Hertz-Lab

local Person = class()

-- init with pos and size in pixels
function Person:__init(x, y, size)
	self.pos = glm.vec2(x, y)
	self.size = size
	self.hover = false
	self.drag = false
end

function Person:draw()
	if self.drag or self.hover then
		of.setColor(200, 200, 100)
	else
		of.setColor(200, 100, 100)
	end
	of.drawCircle(self.pos, self.size)
end

function Person:mouseMoved(x, y)
	local d = glm.fastDistance(self.pos, glm.vec2(x, y))
	self.hover = (d <= self.size)
end

function Person:mousePressed(x, y)
	if not self.hover then return end
	self.drag = true
end

function Person:mouseDragged(x, y)
	if not self.drag then return end
	local dx = x - of.getPreviousMouseX()
	local dy = y - of.getPreviousMouseY()
	self.pos.x = self.pos.x + dx
	self.pos.y = self.pos.y + dy
	if self.pos.x < 0 then self.pos.x = 0 end
	if self.pos.x > of.getWidth() then self.pos.x = of.getWidth() end
	if self.pos.y < 0 then self.pos.y = 0 end
	if self.pos.y > of.getHeight() then self.pos.y = of.getHeight() end
end

function Person:mouseReleased(x, y)
	if not self.drag then return end
	self.drag = false
end

function Person:mouseExited(x, y)
	self.drag = false
	self.hover = false
end

return Person
