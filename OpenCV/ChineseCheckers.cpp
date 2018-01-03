#include "stdafx.h"

#include "opencv2/core.hpp"
#include "opencv2/highgui.hpp"
#include "opencv2/imgproc.hpp"
#include "opencv2/imgcodecs.hpp"
#include "opencv2/aruco.hpp"
#include "opencv2/calib3d.hpp"

#include <iostream>
#include <sstream>
#include <fstream>
#include <algorithm>

using namespace std;
using namespace cv;


const float calibrationSquareDimension = 0.026f;
const float arucoSquareDimension = 0.030f;
const Size chessBoardDimensions = Size(9, 6);

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//used to create and print out aruco markers
void createArucoMarkers()
{
	Mat outputMarker;

	Ptr<aruco::Dictionary> markerDictionary = aruco::getPredefinedDictionary(aruco::PREDEFINED_DICTIONARY_NAME::DICT_4X4_50);

	for (int i = 0; i < 50; i++)
	{
		aruco::drawMarker(markerDictionary, i, 500, outputMarker, 1);
		ostringstream convert;
		string imageName = "4x4Marker_";
		convert << imageName << i << ".png";
		imwrite(convert.str(), outputMarker);
	}
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//create ideal world positions on chess board
void createKnownBoardPositions(Size boardSize, float squareEdgeLength, vector<Point3f>& corners)
{
	for (int i = 0; i < boardSize.height; i++)
	{
		for (int j = 0; j < boardSize.width; j++)
		{
			corners.push_back(Point3f(j * squareEdgeLength, i * squareEdgeLength, 0.0f));
		}
	}
}

//find the realworld chess board corners in a set of images
void getChessBoardCorners(vector<Mat> images, vector<vector<Point2f>>& allFoundCorners, bool showResults = false)
{
	for (vector<Mat>::iterator iter = images.begin(); iter != images.end(); iter++)
	{
		vector<Point2f> pointBuf;
		bool found = findChessboardCorners(*iter, Size(9, 6), pointBuf, CV_CALIB_CB_ADAPTIVE_THRESH | CV_CALIB_CB_NORMALIZE_IMAGE);

		if (found)
		{
			allFoundCorners.push_back(pointBuf);
		}

		if (showResults)
		{
			drawChessboardCorners(*iter, Size(9, 6), pointBuf, found);
			imshow("Looking for Corners", *iter);
			waitKey(0);
		}
	}
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//finds camera calibration values using a set of images
void cameraCalibration(vector<Mat> calibrationImages, Size boardSize, float squareEdgeLength, Mat& cameraMatrix, Mat& distanceCoefficients)
{
	vector<vector<Point2f>> chessBoardImageSpacePoints;
	getChessBoardCorners(calibrationImages, chessBoardImageSpacePoints, false);

	vector<vector<Point3f>> worldSpaceCornerPoints(1);

	createKnownBoardPositions(boardSize, squareEdgeLength, worldSpaceCornerPoints[0]);
	worldSpaceCornerPoints.resize(chessBoardImageSpacePoints.size(), worldSpaceCornerPoints[0]);

	vector<Mat> rVectors, tVectors;
	distanceCoefficients = Mat::zeros(8, 1, CV_64F);

	calibrateCamera(worldSpaceCornerPoints, chessBoardImageSpacePoints, boardSize, cameraMatrix, distanceCoefficients, rVectors, tVectors);
}

//print out a file with the camera calibration values
bool saveCamCalib(string name, Mat cameraMatrix, Mat distanceCoefficients)
{
	ofstream outStream(name);
	if (outStream)
	{
		uint16_t rows = cameraMatrix.rows;
		uint16_t cols = cameraMatrix.cols;

		outStream << rows << endl;
		outStream << cols << endl;

		for (int r = 0; r < rows; r++)
		{
			for (int c = 0; c < cols; c++)
			{
				double value = cameraMatrix.at<double>(r, c);
				outStream << value << endl;
			}
		}
		rows = distanceCoefficients.rows;
		cols = distanceCoefficients.cols;

		outStream << rows << endl;
		outStream << cols << endl;

		for (int r = 0; r < rows; r++)
		{
			for (int c = 0; c < cols; c++)
			{
				double value = distanceCoefficients.at<double>(r, c);
				outStream << value << endl;
			}
		}
		outStream.close();
		return true;
	}
}

//CALL THIS to calibrate a webcam
//space key takes snapshots (get > 15), enter key tries to find calibration for webcam and print a file with the values
int calibWebcam(Mat& cameraMatrix, Mat& distanceCoefficients)
{
	Mat frame;
	Mat drawToFrame;

	vector<Mat> savedImages;

	vector< vector<Point2f> > markerCorners, rejectedCandidates;

	VideoCapture vid(0);

	if (!vid.isOpened())
	{
		cout << "Cannot open the web cam!" << endl;
		return -1;
	}

	int fps = 20;

	namedWindow("Webcam", CV_WINDOW_AUTOSIZE);

	while (true)
	{
		bool bSuccess = vid.read(frame);

		if (!bSuccess)
		{
			cout << "Cannot read a frame from video stream" << endl;
			break;
		}

		Mat foundPoints;
		bool found = false;

		found = findChessboardCorners(frame, Size(9, 6), foundPoints, CV_CALIB_CB_ADAPTIVE_THRESH | CV_CALIB_CB_NORMALIZE_IMAGE | CV_CALIB_CB_FAST_CHECK);
		frame.copyTo(drawToFrame);
		drawChessboardCorners(drawToFrame, Size(9, 6), foundPoints, found);
		if (found)
			imshow("Webcam", drawToFrame);
		else
			imshow("Webcam", frame);

		char c = waitKey(1000 / fps);

		switch (c)
		{
		case ' ':
			//save the image
			if (found)
			{
				Mat temp;
				frame.copyTo(temp);
				savedImages.push_back(temp);
			}
			break;
		case 13: //enter key
				 //start calibration
			if (savedImages.size() > 15)
			{
				cameraCalibration(savedImages, chessBoardDimensions, calibrationSquareDimension, cameraMatrix, distanceCoefficients);
				saveCamCalib("CamCalibValues", cameraMatrix, distanceCoefficients);
			}
			break;
		case 27:
			//exit
			return 0;
			break;
		}
	}

	return 0;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//find an aruco marker (needs camera calibration values)
int startWebcamMonitoring(const Mat& cameraMatrix, const Mat& distanceCoefficients, float arucoSquareDimension)
{
	Mat frame;

	vector<int> markerIds;
	vector<vector<Point2f>> markerCorners, rejectedCandidates;
	aruco::DetectorParameters parameters;

	Ptr<aruco::Dictionary> markerDict = aruco::getPredefinedDictionary(aruco::PREDEFINED_DICTIONARY_NAME::DICT_4X4_50);

	VideoCapture vid(0);

	if (!vid.isOpened())
	{
		cout << "Cannot open the web cam!" << endl;
		return -1;
	}

	namedWindow("Webcam", CV_WINDOW_AUTOSIZE);

	vector<Vec3d> rotationVectors, translationVectors;

	while (true)
	{
		bool bSuccess = vid.read(frame);

		if (!bSuccess)
		{
			cout << "Cannot read a frame from video stream" << endl;
			break;
		}

		//populates markerCorners and markerIds
		aruco::detectMarkers(frame, markerDict, markerCorners, markerIds);

		aruco::estimatePoseSingleMarkers(markerCorners, arucoSquareDimension, cameraMatrix, distanceCoefficients, rotationVectors, translationVectors);

		//find one of the 50 markers and draw the axis
		for (int i = 0; i < markerIds.size(); i++)
		{
			aruco::drawAxis(frame, cameraMatrix, distanceCoefficients, rotationVectors[i], translationVectors[i], 0.1f);
		}
		imshow("Webcam", frame);
		if (waitKey(30) >= 0) break;
	}
	return 1;
}

//loads the camera calibration values from a file
bool loadCamCalib(string name, Mat& cameraMatrix, Mat& distanceCoefficients)
{
	ifstream inStream(name);
	if (inStream)
	{
		uint16_t rows;
		uint16_t cols;

		inStream >> rows;
		inStream >> cols;

		cameraMatrix = Mat(Size(cols, rows), CV_64F);

		for (int r = 0; r < rows; r++)
		{
			for (int c = 0; c < cols; c++)
			{
				double read = 0.0f;
				inStream >> read;
				cameraMatrix.at<double>(r, c) = read;
				cout << cameraMatrix.at<double>(r, c) << "\n";
			}
		}
		//Distance coeficients
		inStream >> rows;
		inStream >> cols;

		distanceCoefficients = Mat::zeros(rows, cols, CV_64F);

		for (int r = 0; r < rows; r++)
		{
			for (int c = 0; c < cols; c++)
			{
				double read = 0.0f;
				inStream >> read;
				distanceCoefficients.at<double>(r, c) = read;
				cout << distanceCoefficients.at<double>(r, c) << "\n";
			}
		}
		inStream.close();
		return true;
	}
	return false;
}

int main(int argv, char** argc)
{
	Mat cameraMatrix = Mat::eye(3, 3, CV_64F);

	Mat distanceCoefficients;

	//calibWebcam(cameraMatrix, distanceCoefficients);
	loadCamCalib("CamCalibValues", cameraMatrix, distanceCoefficients);
	startWebcamMonitoring(cameraMatrix, distanceCoefficients, arucoSquareDimension);

	return 0;
}

