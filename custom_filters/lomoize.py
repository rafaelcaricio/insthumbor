#!/usr/bin/env python
# -*- coding: utf-8 -*-

from cStringIO import StringIO
from PIL import Image
from PIL import ImageEnhance
from PIL import ImageColor

from thumbor.filters import BaseFilter, filter_method


class Filter(BaseFilter):

    @filter_method(BaseFilter.DecimalNumber, BaseFilter.DecimalNumber, BaseFilter.DecimalNumber)
    def lomoize(self, darkness, saturation, alpha):
        image = Image.fromstring(self.engine.get_image_mode(), 
                self.engine.size,
                self.engine.get_image_data())
        darker = ImageEnhance.Brightness(image).enhance(darkness)
        saturated = ImageEnhance.Color(image).enhance(saturation)
        lomoized = Image.blend(saturated, darker, alpha)
        self.engine.set_image_data(lomoized.tostring())
