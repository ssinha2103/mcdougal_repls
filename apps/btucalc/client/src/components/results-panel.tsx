import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Thermometer, Zap, Flame, Calculator, Home, Shield, Sun, Users, TrendingUp, Award, CheckCircle, Download } from "lucide-react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ResultsPanelProps {
  results: {
    heatingBTU: number;
    coolingBTU: number;
    systemType: string;
    recommendations: string[];
    calculationBreakdown?: {
      baseHeatingLoad: number;
      baseCoolingLoad: number;
      ceilingHeightMultiplier: number;
      insulationMultiplier: number;
      windowHeatLoss: number;
      windowSolarGain: number;
      occupantLoad: number;
      climateZone: string;
    };
    equipmentRecommendations?: {
      minisplit?: { brand: string; model: string; capacity: string; efficiency: string };
      central?: { brand: string; model: string; capacity: string; efficiency: string };
      boiler?: { brand: string; model: string; capacity: string; efficiency: string };
    };
  } | null;
}

export function ResultsPanel({ results }: ResultsPanelProps) {
  const generatePDF = async () => {
    if (!results) return;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    let yPosition = margin;

    // Professional Header with Company Branding
    pdf.setFillColor(31, 81, 181);
    pdf.rect(0, 0, pageWidth, 35, 'F');
    
    pdf.setFontSize(20);
    pdf.setTextColor(255, 255, 255);
    pdf.text('N.E.T.R., Inc. - Professional HVAC Analysis', pageWidth / 2, 15, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.text(`Report Generated: ${new Date().toLocaleDateString()}  |  ACCA Manual J Compliant`, pageWidth / 2, 25, { align: 'center' });
    
    yPosition = 45;

    // System Information in Two Columns
    const systemName = results.systemType === 'ductless' ? 'Ductless Mini-Split System' :
                      results.systemType === 'central' ? 'Central Air Conditioning' : 'Gas Boiler System';
    const tonnage = Math.round((results.coolingBTU / 12000) * 2) / 2;
    
    pdf.setFontSize(14);
    pdf.setTextColor(31, 81, 181);
    pdf.text('LOAD CALCULATIONS & SYSTEM SIZING', margin, yPosition);
    yPosition += 10;

    // Left Column - Load Requirements
    pdf.setFontSize(11);
    pdf.setTextColor(0);
    pdf.text('Heating Load:', margin, yPosition);
    pdf.setFontSize(16);
    pdf.setTextColor(220, 53, 69);
    pdf.text(`${results.heatingBTU.toLocaleString()} BTU/hr`, margin + 30, yPosition);
    
    pdf.setFontSize(11);
    pdf.setTextColor(0);
    pdf.text('Cooling Load:', margin, yPosition + 8);
    pdf.setFontSize(16);
    pdf.setTextColor(13, 110, 253);
    pdf.text(`${results.coolingBTU.toLocaleString()} BTU/hr (${tonnage} tons)`, margin + 30, yPosition + 8);

    // Right Column - System Info
    pdf.setFontSize(11);
    pdf.setTextColor(0);
    pdf.text('Recommended System:', pageWidth / 2 + 10, yPosition);
    pdf.text(systemName, pageWidth / 2 + 10, yPosition + 6);
    pdf.text(`Climate Zone: ${results.calculationBreakdown?.climateZone || 'N/A'}`, pageWidth / 2 + 10, yPosition + 12);
    
    yPosition += 25;

    // Calculation Breakdown Section
    if (results.calculationBreakdown) {
      const breakdown = results.calculationBreakdown;
      
      pdf.setFontSize(14);
      pdf.setTextColor(31, 81, 181);
      pdf.text('DETAILED CALCULATION BREAKDOWN', margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(9);
      pdf.setTextColor(0);
      
      // Create table-like structure
      pdf.text('Base Heating Load:', margin, yPosition);
      pdf.text(`${breakdown.baseHeatingLoad.toLocaleString()} BTU/hr`, margin + 60, yPosition);
      pdf.text('Base Cooling Load:', pageWidth / 2 + 10, yPosition);
      pdf.text(`${breakdown.baseCoolingLoad.toLocaleString()} BTU/hr`, pageWidth / 2 + 70, yPosition);
      
      yPosition += 6;
      pdf.text('Ceiling Height Factor:', margin, yPosition);
      pdf.text(`${breakdown.ceilingHeightMultiplier}x`, margin + 60, yPosition);
      pdf.text('Insulation Factor:', pageWidth / 2 + 10, yPosition);
      pdf.text(`${breakdown.insulationMultiplier}x`, pageWidth / 2 + 70, yPosition);
      
      yPosition += 6;
      pdf.text('Window Heat Loss:', margin, yPosition);
      pdf.text(`${breakdown.windowHeatLoss.toLocaleString()} BTU/hr`, margin + 60, yPosition);
      pdf.text('Window Solar Gain:', pageWidth / 2 + 10, yPosition);
      pdf.text(`${breakdown.windowSolarGain.toLocaleString()} BTU/hr`, pageWidth / 2 + 70, yPosition);
      
      yPosition += 6;
      pdf.text('Occupant Load:', margin, yPosition);
      pdf.text(`${breakdown.occupantLoad.toLocaleString()} BTU/hr`, margin + 60, yPosition);
      
      yPosition += 15;
    }

    // Equipment Recommendations
    pdf.setFontSize(14);
    pdf.setTextColor(31, 81, 181);
    pdf.text('EQUIPMENT & EFFICIENCY RECOMMENDATIONS', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(9);
    pdf.setTextColor(0);
    
    const efficiencyText = [
      '• Minimum 16 SEER cooling efficiency for optimal performance',
      '• High-efficiency equipment reduces operating costs by 20-40%',
      '• Energy Star certified units may qualify for utility rebates'
    ];
    
    efficiencyText.forEach(text => {
      pdf.text(text, margin, yPosition);
      yPosition += 5;
    });
    
    yPosition += 8;

    // Annual Cost Analysis
    pdf.setFontSize(14);
    pdf.setTextColor(31, 81, 181);
    pdf.text('ESTIMATED ANNUAL OPERATING COSTS', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setTextColor(0);
    const coolingCost = Math.round(results.coolingBTU * 0.00045);
    const heatingCost = Math.round(results.heatingBTU * 0.00055);
    const totalCost = coolingCost + heatingCost;
    
    pdf.text(`Cooling Season (4 months): $${coolingCost} - $${Math.round(coolingCost * 1.3)}`, margin, yPosition);
    pdf.text(`Heating Season (6 months): $${heatingCost} - $${Math.round(heatingCost * 1.3)}`, margin, yPosition + 6);
    pdf.text(`Total Annual Estimate: $${totalCost} - $${Math.round(totalCost * 1.3)}`, margin, yPosition + 12);
    pdf.setFontSize(8);
    pdf.setTextColor(100);
    pdf.text('*Based on average New England utility rates. High-efficiency equipment can reduce costs by 25-35%', margin, yPosition + 20);
    
    yPosition += 30;

    // Installation Considerations
    pdf.setFontSize(14);
    pdf.setTextColor(31, 81, 181);
    pdf.text('INSTALLATION CONSIDERATIONS', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(9);
    pdf.setTextColor(0);
    
    let installationNotes: string[] = [];
    if (results.systemType === 'ductless') {
      installationNotes = [
        '• Indoor unit placement for optimal airflow coverage',
        '• Outdoor unit positioning with proper clearances',
        '• Refrigerant line routing for maximum efficiency',
        '• Individual zone temperature control capabilities'
      ];
    } else if (results.systemType === 'central') {
      installationNotes = [
        '• Existing ductwork evaluation and potential upgrades',
        '• Indoor/outdoor unit placement optimization',
        '• Electrical requirements and potential panel upgrades',
        '• Air filtration and indoor air quality improvements'
      ];
    } else {
      installationNotes = [
        '• Proper boiler sizing for heating load requirements',
        '• Distribution system compatibility (radiators/baseboard)',
        '• Venting and gas line sizing requirements',
        '• Safety controls and carbon monoxide protection'
      ];
    }
    
    installationNotes.forEach(note => {
      pdf.text(note, margin, yPosition);
      yPosition += 5;
    });
    
    yPosition += 10;

    // Professional Recommendations
    if (results.recommendations && results.recommendations.length > 0) {
      pdf.setFontSize(14);
      pdf.setTextColor(31, 81, 181);
      pdf.text('PROFESSIONAL RECOMMENDATIONS', margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(9);
      pdf.setTextColor(0);
      
      results.recommendations.slice(0, 3).forEach((rec, index) => {
        const lines = pdf.splitTextToSize(`• ${rec}`, pageWidth - (margin * 2));
        lines.forEach((line: string) => {
          pdf.text(line, margin, yPosition);
          yPosition += 4;
        });
        yPosition += 2;
      });
    }

    // Contact and Service Information Footer
    yPosition = 250; // Fixed footer position
    
    pdf.setFillColor(245, 245, 245);
    pdf.rect(margin, yPosition, pageWidth - (margin * 2), 35, 'F');
    pdf.setDrawColor(31, 81, 181);
    pdf.setLineWidth(1);
    pdf.rect(margin, yPosition, pageWidth - (margin * 2), 35);
    
    pdf.setFontSize(12);
    pdf.setTextColor(31, 81, 181);
    pdf.text('CONTACT N.E.T.R., INC. FOR PROFESSIONAL INSTALLATION', pageWidth / 2, yPosition + 8, { align: 'center' });
    
    pdf.setFontSize(10);
    pdf.setTextColor(0);
    pdf.text('Phone: (978) 373-1250  |  Email: info@netrinc.com  |  Web: www.netrinc.com', pageWidth / 2, yPosition + 16, { align: 'center' });
    pdf.text('Licensed & Insured • 25+ Years Experience • 24/7 Emergency Service', pageWidth / 2, yPosition + 24, { align: 'center' });

    // Disclaimer
    pdf.setFontSize(7);
    pdf.setTextColor(100);
    const disclaimer = 'This analysis follows ACCA Manual J principles. Final equipment selection requires on-site evaluation. Costs are estimates based on average rates.';
    pdf.text(disclaimer, pageWidth / 2, yPosition + 32, { align: 'center' });

    // Save the PDF
    const fileName = `NETR-HVAC-Analysis-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  };

  if (!results) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <div className="text-gray-500 mb-4">
          <Thermometer className="mx-auto h-12 w-12 mb-3 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">BTU Calculation Results</h3>
          <p>Complete the form to see your HVAC requirements</p>
        </div>
      </div>
    );
  }

  const systemTypeNames = {
    ductless: "Ductless Mini-Split System",
    central: "Central Air Conditioning",
    boiler: "Gas Boiler System"
  };

  return (
    <div className="space-y-6">
      {/* Main BTU Results */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-netr-blue flex items-center">
            <Thermometer className="mr-3" />
            BTU Requirements
          </h3>
          <Button 
            onClick={generatePDF}
            className="bg-netr-blue hover:bg-netr-blue/90 text-white flex items-center gap-2"
            size="sm"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>

        <div className="space-y-4">
          {/* Heating Requirements */}
          <Card className="p-4 bg-orange-50/60 border-orange-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Flame className="h-5 w-5 text-orange-600 mr-3" />
                <span className="font-medium text-orange-800">Heating Load</span>
              </div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-lg px-3 py-1">
                {results.heatingBTU.toLocaleString()} BTU/hr
              </Badge>
            </div>
          </Card>

          {/* Cooling Requirements */}
          <Card className="p-4 bg-blue-50/60 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Zap className="h-5 w-5 text-blue-600 mr-3" />
                <span className="font-medium text-blue-800">Cooling Load</span>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-lg px-3 py-1">
                {results.coolingBTU.toLocaleString()} BTU/hr
              </Badge>
            </div>
          </Card>
        </div>
      </div>

      {/* System Information */}
      <div className="glass-card rounded-2xl p-6">
        <h4 className="text-lg font-semibold text-netr-blue mb-4 flex items-center">
          <Home className="mr-2 h-5 w-5" />
          Selected System
        </h4>
        <div className="bg-blue-50/60 p-4 rounded-lg">
          <p className="font-medium text-blue-900">
            {systemTypeNames[results.systemType as keyof typeof systemTypeNames] || results.systemType}
          </p>
          <p className="text-sm text-blue-700 mt-1">
            Professional-grade calculation based on ACCA Manual J standards
          </p>
        </div>
      </div>

      {/* Calculation Breakdown */}
      {results.calculationBreakdown && (
        <div className="glass-card rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-netr-blue mb-4 flex items-center">
            <Calculator className="mr-2 h-5 w-5" />
            Calculation Breakdown
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm text-gray-700 flex items-center">
                <Home className="mr-2 h-4 w-4 text-gray-500" />
                Base Heating Load
              </span>
              <span className="font-medium">{results.calculationBreakdown.baseHeatingLoad.toLocaleString()} BTU/hr</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm text-gray-700 flex items-center">
                <Zap className="mr-2 h-4 w-4 text-gray-500" />
                Base Cooling Load
              </span>
              <span className="font-medium">{results.calculationBreakdown.baseCoolingLoad.toLocaleString()} BTU/hr</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm text-gray-700 flex items-center">
                <TrendingUp className="mr-2 h-4 w-4 text-gray-500" />
                Ceiling Height Factor
              </span>
              <span className="font-medium">{results.calculationBreakdown.ceilingHeightMultiplier}x</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm text-gray-700 flex items-center">
                <Shield className="mr-2 h-4 w-4 text-gray-500" />
                Insulation Factor
              </span>
              <span className="font-medium">{results.calculationBreakdown.insulationMultiplier}x</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm text-gray-700 flex items-center">
                <Sun className="mr-2 h-4 w-4 text-gray-500" />
                Window Heat Loss/Gain
              </span>
              <span className="font-medium">{Math.abs(results.calculationBreakdown.windowHeatLoss).toLocaleString()} BTU/hr</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-700 flex items-center">
                <Users className="mr-2 h-4 w-4 text-gray-500" />
                Occupant Load
              </span>
              <span className="font-medium">{results.calculationBreakdown.occupantLoad.toLocaleString()} BTU/hr</span>
            </div>
          </div>
        </div>
      )}

      {/* Equipment Recommendations */}
      <div className="glass-card rounded-2xl p-6">
        <h4 className="text-lg font-semibold text-netr-blue mb-4 flex items-center">
          <Award className="mr-2 h-5 w-5" />
          Equipment Recommendations
        </h4>
        
        {/* Based on System Type */}
        <div className="space-y-4">
          {results.systemType === 'ductless' && (
            <div className="bg-blue-50/60 p-4 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-2">Recommended Mini-Split System</h5>
              <div className="space-y-2 text-sm">
                <p><strong>Brand:</strong> Mitsubishi Electric (Elite Diamond Contractor)</p>
                <p><strong>Model:</strong> MSZ-GL Series or MXZ Multi-Zone</p>
                <p><strong>Capacity:</strong> {Math.ceil(Math.max(results.heatingBTU, results.coolingBTU) / 1000)}K BTU/hr</p>
                <p><strong>SEER Rating:</strong> 22+ (High Efficiency)</p>
                <p><strong>Features:</strong> Inverter technology, Wi-Fi control, hyper-heating</p>
              </div>
            </div>
          )}
          
          {results.systemType === 'central' && (
            <div className="bg-green-50/60 p-4 rounded-lg">
              <h5 className="font-medium text-green-900 mb-2">Recommended Central AC System</h5>
              <div className="space-y-2 text-sm">
                <p><strong>Brand:</strong> Lennox or Bosch</p>
                <p><strong>Model:</strong> Variable speed condenser</p>
                <p><strong>Capacity:</strong> {Math.ceil(results.coolingBTU / 12000)} tons</p>
                <p><strong>SEER Rating:</strong> 16+ (Energy Star qualified)</p>
                <p><strong>Features:</strong> Variable speed, smart thermostat ready</p>
              </div>
            </div>
          )}
          
          {results.systemType === 'boiler' && (
            <div className="bg-orange-50/60 p-4 rounded-lg">
              <h5 className="font-medium text-orange-900 mb-2">Recommended Boiler System</h5>
              <div className="space-y-2 text-sm">
                <p><strong>Brand:</strong> Bosch or Navien</p>
                <p><strong>Type:</strong> Condensing gas boiler</p>
                <p><strong>Input:</strong> {Math.ceil(results.heatingBTU * 1.15 / 1000)}K BTU/hr</p>
                <p><strong>AFUE Rating:</strong> 95%+ (High efficiency)</p>
                <p><strong>Features:</strong> Modulating burner, outdoor reset</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Professional Recommendations */}
      <div className="glass-card rounded-2xl p-6">
        <h4 className="text-lg font-semibold text-netr-blue mb-4 flex items-center">
          <CheckCircle className="mr-2 h-5 w-5" />
          Professional Recommendations
        </h4>
        <div className="space-y-3">
          <div className="bg-yellow-50/60 p-4 rounded-lg border-l-4 border-yellow-400">
            <p className="text-sm text-yellow-800">
              <strong>Manual J Load Calculation:</strong> These estimates are based on industry-standard calculations. 
              For final equipment sizing, a professional Manual J load calculation is recommended.
            </p>
          </div>
          
          {results.recommendations.length > 0 && (
            <div className="space-y-2">
              {results.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-2 bg-blue-50/60 p-3 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">{rec}</p>
                </div>
              ))}
            </div>
          )}
          
          <div className="bg-netr-blue/10 p-4 rounded-lg border border-netr-blue/20">
            <p className="text-sm text-netr-blue font-medium mb-2">
              Ready for professional installation?
            </p>
            <p className="text-sm text-gray-700">
              Contact N.E.T.R., Inc at <strong>781-933-6387</strong> for a free in-home consultation 
              and accurate Manual J load calculation. Over 35 years of HVAC experience in New England.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}