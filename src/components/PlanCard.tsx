import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Plan } from "@/lib/index";
import { formatPrice } from "@/lib/index";
import { springPresets, hoverLift } from "@/lib/motion";

interface PlanCardProps {
  plan: Plan;
  onSelect: (plan: Plan) => void;
}

export function PlanCard({ plan, onSelect }: PlanCardProps) {
  return (
    <motion.div
      variants={hoverLift}
      initial="rest"
      whileHover="hover"
      className="h-full"
    >
      <Card
        className={`relative h-full overflow-hidden border-2 transition-all duration-200 ${
          plan.recommended
            ? "border-primary shadow-lg"
            : "border-border hover:border-primary/50"
        }`}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-50`}
        />

        <div className="relative p-6 flex flex-col h-full">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-foreground mb-1">
                {plan.name}
              </h3>
              <p className="text-sm text-muted-foreground">{plan.nameEn}</p>
            </div>
            {plan.recommended && (
              <Badge
                variant="default"
                className="bg-primary text-primary-foreground flex items-center gap-1"
              >
                <Star className="w-3 h-3 fill-current" />
                Recommended
              </Badge>
            )}
          </div>

          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-foreground">
                {formatPrice(plan.price, plan.currency)}
              </span>
              <span className="text-muted-foreground">/ {plan.duration}</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            {plan.description}
          </p>

          <div className="flex-1 mb-6">
            <ul className="space-y-3">
              {plan.features.map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    ...springPresets.gentle,
                    delay: index * 0.05,
                  }}
                  className="flex items-start gap-2"
                >
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{feature}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <Button
            onClick={() => onSelect(plan)}
            size="lg"
            className="w-full"
            variant={plan.recommended ? "default" : "outline"}
          >
            Select This Plan
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
