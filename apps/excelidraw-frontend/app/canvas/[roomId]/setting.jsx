'use client';
import React, { useEffect, useState } from 'react';

export const Setting = ({ canvas }) => {
    const [selectedObject, Setselectedobject] = useState(null);
    const [width, Setwidth] = useState('');
    const [height, Setheight] = useState('');
    const [diameter, Setdiameter] = useState('');
    const [color, Setcolor] = useState('');

    useEffect(() => {
        if (canvas) {
            const handleSelectionCreated = (event) => handleObjectSelection(event.selected[0]);
            const handleSelectionUpdated = (event) => handleObjectSelection(event.selected[0]);
            const handleSelectionCleared = () => {
                Setselectedobject(null);
                clearSetting();
            };
            const handleSelectionModified = (event) => handleObjectSelection(event.target);
            const handleSelectionScaling = (event) => handleObjectSelection(event.target);

            canvas.on('selection:created', handleSelectionCreated);
            canvas.on('selection:updated', handleSelectionUpdated);
            canvas.on('selection:cleared', handleSelectionCleared);
            canvas.on('selection:modified', handleSelectionModified);
            canvas.on('selection:scaling', handleSelectionScaling);
        }
    }, [canvas]);

    const handleObjectSelection = (object) => {
        if (!object) return;
        Setselectedobject(object);

        if (object.type === 'rect') {
            Setwidth(Math.round(object.width * object.scaleX));
            Setheight(Math.round(object.height * object.scaleY));
            Setcolor(object.fill);
            Setdiameter('');
        } else if (object.type === 'circle') {
            Setdiameter(Math.round(object.radius * 2 * object.scaleX)); // Diameter
            Setcolor(object.fill);
            Setwidth('');
            Setheight('');
        }
    };

    const clearSetting = () => {
        Setwidth('');
        Setheight('');
        Setdiameter('');
        Setcolor('');
    };

    return (
        <div className="fixed inset-y-1/2 -translate-y-1/2 right-4 bg-zinc-800 shadow-md h-fit rounded-lg w-64 border border-gray-600 z-50">
            {selectedObject ? (
                <div className="space-y-4 p-4 w-fit h-fit">
                    {selectedObject.type === 'rect' && (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">Width:</label>
                                <input
                                    type="number"
                                    value={width}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value);
                                        Setwidth(value);
                                        selectedObject.set('width', value / selectedObject.scaleX);
                                        canvas.renderAll();
                                    }}
                                    className="input input-bordered w-fit mx-3 text-white border-gray-700 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm w-fit h-fit font-medium text-white mb-2">Height:</label>
                                <input
                                    type="number"
                                    value={height}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value);
                                        Setheight(value);
                                        selectedObject.set('height', value / selectedObject.scaleY);
                                        canvas.renderAll();
                                    }}
                                    className="input input-bordered w-full  text-white border-gray-700 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    )}
                    {selectedObject.type === 'circle' && (
                        <div className=''>
                            <label className="block text-sm font-medium text-white mb-2">Diameter:</label>
                            <input
                                type="number"
                                value={diameter}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    Setdiameter(value);
                                    selectedObject.set('radius', value / 2 / selectedObject.scaleX);
                                    canvas.renderAll();
                                }}
                                className="input input-bordered w-fit  text-white border-gray-700 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-500"
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">Color:</label>
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => {
                                const value = e.target.value;
                                Setcolor(value);
                                selectedObject.set('fill', value);
                                canvas.renderAll();
                            }}
                            className="w-full  h-8 p-1 border border-gray-700 rounded-md text-white focus:outline-none focus:ring focus:ring-blue-500"
                        />
                    </div>
                </div>
            ) : (
                <></>
            )}
        </div>
    );
};

export default Setting;
