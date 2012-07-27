#!/usr/bin/env python
# -*- coding: utf-8 -*-

from os.path import abspath

from cStringIO import StringIO
from PIL import Image
from PIL import ImageEnhance
from PIL import ImageColor

from thumbor.filters import BaseFilter, filter_method

MASK_IMAGE = Image.open(abspath('./custom_filters/mask256x256.jpeg'))

class Filter(BaseFilter):

    @filter_method(BaseFilter.DecimalNumber, BaseFilter.DecimalNumber)
    def lomoize(self, darkness, saturation):
        image = Image.fromstring(self.engine.get_image_mode(),
                self.engine.size,
                self.engine.get_image_data())

        (width, height) = image.size
        max_size = width
        if height > width :
            max_size = height

        mask = MASK_IMAGE.resize((max_size, max_size))

        left = (max_size - width) / 2
        upper = (max_size - height) / 2

        mask = mask.crop((left, upper, left+width, upper + height))

        darker = ImageEnhance.Brightness(image).enhance(darkness)
        saturated = ImageEnhance.Color(image).enhance(saturation)

        lomoized = Image.composite(saturated, darker, mask)

        self.engine.set_image_data(lomoized.tostring())
