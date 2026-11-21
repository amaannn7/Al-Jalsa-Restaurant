// Removes the background from photos using Apple's Vision framework (macOS 14+).
// Usage: swift cutout.swift <in-dir> <out-dir>
import Foundation
import Vision
import CoreImage
import CoreImage.CIFilterBuiltins
import ImageIO
import UniformTypeIdentifiers

let args = CommandLine.arguments
let inDir = URL(fileURLWithPath: args[1]), outDir = URL(fileURLWithPath: args[2])
try? FileManager.default.createDirectory(at: outDir, withIntermediateDirectories: true)
let ctx = CIContext()
let files = try FileManager.default.contentsOfDirectory(at: inDir, includingPropertiesForKeys: nil)
  .filter { ["png","jpg","jpeg"].contains($0.pathExtension.lowercased()) }
for f in files {
  guard let src = CIImage(contentsOf: f) else { print("skip", f.lastPathComponent); continue }
  let handler = VNImageRequestHandler(ciImage: src)
  let req = VNGenerateForegroundInstanceMaskRequest()
  do {
    try handler.perform([req])
    guard let obs = req.results?.first else { print("nomask", f.lastPathComponent); continue }
    let buf = try obs.generateMaskedImage(ofInstances: obs.allInstances, from: handler, croppedToInstancesExtent: false)
    let out = CIImage(cvPixelBuffer: buf)
    let name = f.deletingPathExtension().lastPathComponent + ".png"
    try ctx.writePNGRepresentation(of: out, to: outDir.appendingPathComponent(name), format: .RGBA8, colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!)
    print("ok", name, obs.allInstances.count)
  } catch { print("err", f.lastPathComponent, error) }
}
