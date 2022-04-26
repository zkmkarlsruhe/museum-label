-- artwork class, static dummy
-- Copyright (c) 2021 Dan Wilcox ZKM | Hertz-Lab

local Artwork = class()

-- init with pos and size
function Artwork:__init(x, y, w, h)
	self.frame = of.Rectangle(x, y, w, h)
end

function Artwork:draw()
	of.setColor(255)
	of.drawRectangle(self.frame)
end

return Artwork
