/*
Copyright (c) 2013 Manuel Guerra
http://macroscopio.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/**
* ImageUtils
* collection of utility functions for image processing  
* for performance reason, the methods are destructive, i.e., don't create a copy of the source image
*/

/*
* 
* TODO: 
*   - make destructive behavour optional
*   - wrap ImageData in a class, and merge with ImageUtils
*
*/
var ImageUtils = {

    /**
    * imgDiff
    * returns absolute difference between two images
    *
    * @namespace ImageUtils
    * @method imgDiff
    * @param {ImageData}    img_1   Image 1
    * @param {ImageData}    img_2   Image 2
    * @return {ImageData}   |img_1 - img_2|
    */
    imgDiff: function (img_1, img_2) {

        var pix_1 = img_1.data;
        var pix_2 = img_2.data;

        var diff = img_1;
        var diffPix = diff.data;

        var n = pix_1.length;

        for (var i = 0; i < n; i+=4) {
            var d = Math.abs( pix_1[i] - pix_2[i] );
            diffPix[i] = diffPix[i+1] = diffPix[i+2] = d;
            diffPix[i+3] = 255;
        }

        return diff;    
    },


    /**
    * threshold
    * applies threshold on a image
    *
    * @namespace ImageUtils
    * @method threshold
    * @param {ImageData}    img Image to be thresholded
    * @param {Int}          val Threshold value (0-255)
    * @return {int}         resulting image image
    */
    threshold: function( args ) {

        var img = args.img;
        var val = args.val;

        var pix = img.data;
        var n = pix.length;

        for (var i = 0; i < n; i+=4) {
            if (pix[i] > val) {
                pix[i] = pix[i+1] = pix[i+2] = 255;
            }
            else {
                pix[i] = pix[i+1] = pix[i+2] = 0;
            }
        }

        return img;
    },


    /**
    * count pixels
    * count non zero pixels on an grayscale RGBA image
    *
    * @namespace ImageUtils
    * @method countPixels
    * @param {ImageData}    img: input image
    * @return {int}         non zero pixels count
    */  
    countPixels: function( img ) {

        var pix = img.data;
        var n = pix.length;
        var count = 0;
        
        var w = img.width;
        var h = img.height;
        
        for (var i = 0; i < n; i+=4) {
            if (pix[i] > 0) {
                count++;
            }
        }

        return count;
    },


    /**
    * erode
    * applies NxN erosion on a binary image
    *
    * @namespace ImageUtils
    * @method erode
    * @param {ImageData}    img: input image
    * @param {int}          ker: kernel width 
    * @return {int}         non zero pixels count
    */ 
    erode: function( args ) {
        var img = args.img;
        var ker = args.kernel;

        var pix = img.data;
        var tmp = new Uint8ClampedArray(pix);   // copies the original image's pixel data array
        tmp.set(pix);

        var w = img.width;
        var h = img.height;

        for (var i = 0; i < w; i++) {
            for (var j = 0; j < h; j++) {
                
                var min = 255;
                for (k = Math.max(i-ker,0); k < Math.min(i+ker,w); k++) {
                    for (l = Math.max(j-ker,0); l < Math.min(j+ker,h); l++) {
                        if (tmp[ 4*(l*w + k) ] == 0) {
                           min = 0;
                        }
                    }
                }
                
                pix[ 4*(j*w + i) ] = pix[ 4*(j*w + i) + 1 ] = pix[ 4*(j*w + i) + 2] = min;
            }
        }

        return img;
    },


    /**
    * toGrayscale
    * converts image to grayscale
    *
    * @namespace ImageUtils
    * @method toGrayscale
    * @param {ImageData}    img: input RGBA image
    * @return {ImageData}   resulting grayscale image
    */ 
    toGrayscale: function( img ) {

        var pix = img.data;
        var n = pix.length;

        for (var i = 0; i < n; i+=4) {
            red = pix[i  ];
            green = pix[i+1];
            blue = pix[i+2]; 

            gray = 0.299*red + 0.587*green + 0.114*blue; // YUV model luma component
            pix[i] = pix[i+1] = pix[i+2] = gray;
        }

        return img;
    }
}
